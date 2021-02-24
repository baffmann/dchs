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
	if tmpLength != len(players) {
		fmt.Println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!VALUE CHANGED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", len(players), cap(players))
	}
	tmpLength = len(players)
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

func readArchive() {
	archive = nil
	records, _ := db.ReadAll("archive")
	for _, f := range records {
		playerFound := Player{}
		if err := json.Unmarshal([]byte(f), &playerFound); err != nil {
			fmt.Println("Error unmarshaling player database: ", err)
		}
		archive = append(archive, playerFound)
	}
}
