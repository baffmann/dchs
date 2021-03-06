package main

import (
	"encoding/json"
	"fmt"

	"github.com/sdomino/scribble"
)

var db *scribble.Driver

func readPlayers() {
	records, err := db.ReadAll("players")
	if err != nil {
		fmt.Println("Error reading players: ", err)
	}
	players = nil
	for _, f := range records {
		playerFound := Player{}
		if err := json.Unmarshal([]byte(f), &playerFound); err != nil {
			fmt.Println("Error unmarshaling player database: ", err)
		}
		players = append(players, playerFound)
	}
}

func readSettings() {
	db.Read("settings", "settings", &settings)
}

func updateSettings(setting GameSettings) (err error) {
	if err := db.Write("settings", "settings", setting); err != nil {
		return err
	}
	return nil
}
