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
	BestAVG          float64 `json:"bestavg"`
	GamesPlayed      int     `json:"gamesplayed"`
	OneHundred       int     `json:"onehundred"`
	OneHundredForty  int     `json:"onehundredforty"`
	OneHundredEighty int     `json:"onehundredeighty"`
}

type X01Setting struct {
	Points int `json:"points"`
	//Gamemode int `json:"version"`
}

type GameSettings struct {
	Version    string     `json:"version"`
	Title      string     `json:"title"`
	Connection bool       `json:"connection"`
	X01        X01Setting `json:"x01"`
}

var workingDir, dbDir, webPath string

var players []Player
var version string
var settings GameSettings

//only called on menu page, resets players array and updates database
func resetPlayers() {
	readPlayers()
	for i := range players {
		players[i].Points = settings.X01.Points
		players[i].Active = false
		players[i].Finished = false
		players[i].Order = 0
		players[i].Average = 0
		players[i].Score = nil
		players[i].Tries = 0
		players[i].Ranking = 99
		if err := db.Write("players", players[i].Name, players[i]); err != nil {
			fmt.Println("Error", err)
		}
	}
	//fmt.Println(players)
}

func getEnv() {

	if os.Getenv("SNAP") != "" {
		workingDir = string(os.Getenv("SNAP"))
		dbDir = string(os.Getenv("SNAP_DATA"))
	} else {
		workingDir = "."
		dbDir = "./"
	}
}

func setSettings() {
	if _, err := os.Stat(dbDir + "/settings/settings.json"); err == nil {
		readSettings()
	} else {
		//initial settings
		settings.Title = "Darts Scoreboard"
	}

	if os.Getenv("SNAP_REVISION") != "" {
		settings.Version = string(os.Getenv("SNAP_REVISION"))
	} else {
		settings.Version = "debug"
	}

	if !connected() {
		settings.Connection = false
	} else {
		settings.Connection = true
	}
	updateSettings(settings)
	settings.X01.Points = 501
}

func connected() (ok bool) {
	_, err := http.Get("http://clients3.google.com/generate_204")
	if err != nil {
		return false
	}
	return true
}
func init() {
	getEnv()

	webPath = workingDir + "/web/"
	fmt.Println("Website is hosted at " + webPath)
	var err error
	db, err = scribble.New(dbDir, nil)
	if err != nil {
		fmt.Println("Error creating database: ", err)
	}
	fmt.Println("Database initiated at " + dbDir)

	setSettings()

	resetPlayers()
}

func main() {
	fmt.Println("Welcome to DCHS Darts Scoreboard!")

	r := mux.NewRouter()

	r.HandleFunc("/api/delete", delete).Methods("POST")
	r.HandleFunc("/api/player", player).Methods("GET")
	r.HandleFunc("/api/update", update).Methods("POST")
	r.HandleFunc("/api/player", create).Methods("POST")
	r.HandleFunc("/api/reset", resetGame).Methods("POST")
	r.HandleFunc("/api/quitGame", quitGame).Methods("POST")
	r.HandleFunc("/api/settings", getSetting).Methods("POST")
	r.HandleFunc("/api/updateSettings", newSettings).Methods("POST")
	r.HandleFunc("/api/startGame", startGame).Methods("POST")

	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webPath)))

	fmt.Println("Starting webserver at port 64760")
	err := http.ListenAndServe(":64760", r)
	if err != nil {
		fmt.Println("Error starting webserver: ", err)
		os.Exit(1)
	}
}
