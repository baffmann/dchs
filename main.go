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
		db.Write("players", item.Name, item)
	}
}

func main() {
	var err error
	db, err = scribble.New("./", nil)
	if err != nil {
		fmt.Println("Error creating database: ", err)
	}

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

	var webPath string

	if os.Getenv("SNAP") != "" {
		webPath = string(os.Getenv("SNAP")) + "/web/"
	} else {
		webPath = "./web/"
	}

	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webPath)))

	err = http.ListenAndServe(":64760", r)
	if err != nil {
		fmt.Println("Error starting webserver: ", err)
	}
}
