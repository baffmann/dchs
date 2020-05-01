package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/sdomino/scribble"
)

type Player struct {
	ID       int      `json:"id"`
	Name     string   `json:"name"`
	Active   bool     `json:"active"`
	Finished bool     `json:"finished"`
	Points   int      `json:"points"`
	Score    [][3]int `json:"score"`
	Average  float64  `json:"avg"`
	Order    int      `json:"order"`
	Tries    int      `json:"tries"`
	Ranking  int      `json:"ranking"`
}

/*type GameData struct {
	Round  int  `json:"round"`
	Double bool `json:"double"`
	Triple bool `json:"triple"`
}
var gameData GameData*/

var workingDir, dbDir string

var players []Player

func initGame() {
	readPlayers()
	for _, item := range players {
		item.Points = 501
		item.Active = false
		item.Finished = false
		item.Order = 0
		item.Average = 0
		item.Score = nil
		item.Tries = 0
		item.Ranking = 99
		updatePlayer(item.Name, item)
	}
}

func main() {
	fmt.Println("Welcome to DCHS Darts Scoreboard!")
	if os.Getenv("SNAP") != "" {
		workingDir = string(os.Getenv("SNAP"))
	} else {
		workingDir = "."
	}

	if os.Getenv("SNAP_DATA") != "" {
		dbDir = string(os.Getenv("SNAP_DATA"))
	} else {
		dbDir = "./"
	}

	webPath := workingDir + "/web/"
	fmt.Println("Website is hosted at " + webPath)
	var err error

	db, err = scribble.New(dbDir, nil)
	if err != nil {
		fmt.Println("Error creating database: ", err)
	}
	fmt.Println("Database initiated at " + dbDir)

	initGame()

	r := mux.NewRouter()

	//r.HandleFunc("/<your-url>", <function-name>).Methods("<method>")
	r.HandleFunc("/api/delete", delete).Methods("POST")
	//r.HandleFunc("/api/switchGame", switchGame).Methods("GET")
	r.HandleFunc("/api/player", allplayers).Methods("GET")
	//r.HandleFunc("/api/player/{id}", player).Methods("GET")
	r.HandleFunc("/api/update", update).Methods("POST")
	//Save for later
	//r.HandleFunc("/api/gamedata", updateGameData).Methods("POST")

	r.HandleFunc("/api/player", createPlayer).Methods("POST")
	//r.HandleFunc("/api/player/points", setPoints).Methods("POST")
	r.HandleFunc("/api/reset", resetGame).Methods("POST")
	r.HandleFunc("/api/quitGame", quitGame).Methods("POST")

	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webPath)))

	fmt.Println("Starting webserver at port 64760")
	err = http.ListenAndServe(":64765", r)
	if err != nil {
		fmt.Println("Error starting webserver: ", err)
		os.Exit(1)
	}
}
