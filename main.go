package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/sdomino/scribble"
)

type Player struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Active      bool     `json:"active"`
	Finished    bool     `json:"finished"`
	Points      int      `json:"points"`
	Score       [][3]int `json:"score"`
	Average     float64  `json:"avg"`
	Order       int      `json:"order"`
	Tries       int      `json:"tries"`
	Ranking     int      `json:"ranking"`
	PlayerStats Stats    `json:"stats"`
}

type Stats struct {
	BestAVG     float64 `json:"bestavg"`
	GamesPlayed int     `json:"gamesplayed"`
	BestScore   int     `json:"bestscore"`
}

type Score struct {
	One int
}

type GameSettings struct {
	Version    string `json:"version"`
	Title      string `json:"title"`
	Connection bool   `json:"connection"`
}

/*type GameData struct {
	Round  int  `json:"round"`
	Double bool `json:"double"`
	Triple bool `json:"triple"`
}
var gameData GameData*/

var workingDir, dbDir string

var players []Player
var archive []Player
var version string
var settings GameSettings

func initGame() {
	readPlayers()

	if _, err := os.Stat(workingDir + "/settings/settings.json"); err == nil {
		readSettings()
	} else {
		//initial settings
		settings.Title = "Darts Scoreboard"
		updateSettings(settings)
	}

	if !connected() {
		settings.Connection = false
	} else {
		settings.Connection = true
	}

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

func getEnv() {
	if os.Getenv("SNAP") != "" {
		workingDir = string(os.Getenv("SNAP"))
		dbDir = string(os.Getenv("SNAP_DATA"))
		settings.Version = string(os.Getenv("SNAP_REVISION"))
	} else {
		workingDir = "."
		dbDir = "./"
		settings.Version = "debug"
	}

	if os.Getenv("SNAP_DATA") != "" {
		dbDir = string(os.Getenv("SNAP_DATA"))
	} else {

	}
}

func connected() (ok bool) {
	_, err := http.Get("http://clients3.google.com/generate_204")
	if err != nil {
		return false
	}
	return true
}

func main() {
	fmt.Println("Welcome to DCHS Darts Scoreboard!")

	getEnv()

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

	r.HandleFunc("/api/delete", delete).Methods("POST")
	r.HandleFunc("/api/player", player).Methods("GET")
	r.HandleFunc("/api/update", update).Methods("POST")
	r.HandleFunc("/api/player", create).Methods("POST")
	r.HandleFunc("/api/reset", resetGame).Methods("POST")
	r.HandleFunc("/api/quitGame", quitGame).Methods("POST")
	r.HandleFunc("/api/stats", stats).Methods("POST")
	r.HandleFunc("/api/updateSettings", newSettings).Methods("POST")

	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webPath)))

	fmt.Println("Starting webserver at port 64760")
	err = http.ListenAndServe(":64760", r)
	if err != nil {
		fmt.Println("Error starting webserver: ", err)
		os.Exit(1)
	}
}
