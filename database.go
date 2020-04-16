package main

import (
	"encoding/json"
	"fmt"

	"github.com/sdomino/scribble"
)

var db *scribble.Driver

func readPlayers() {
	players = nil
	records, _ := db.ReadAll("players")
	for _, f := range records {
		playerFound := Player{}
		if err := json.Unmarshal([]byte(f), &playerFound); err != nil {
			fmt.Println("Error unmarshaling player database: ", err)
		}
		players = append(players, playerFound)
	}
}

func updatePlayer(name string, player Player) (err error) {
	if err := db.Write("players", name, player); err != nil {
		return err
	}

	return nil
}

func deletePlayer(name string) (err error) {
	if err := db.Delete("players", name); err != nil {
		return err
	}
	return nil
}
