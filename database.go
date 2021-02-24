package main

import (
	"encoding/json"
	"fmt"

	"github.com/sdomino/scribble"
)

var db *scribble.Driver

func readPlayers() {
	players = nil
	records, err := db.ReadAll("players")
	if err != nil {
		fmt.Println("Error reading players: ", err)
	}
	for _, f := range records {
		playerFound := Player{}
		if err := json.Unmarshal([]byte(f), &playerFound); err != nil {
			fmt.Println("Error unmarshaling player database: ", err)
		}
		players = append(players, playerFound)
	}
	fmt.Println("Length of players array after readplayer: ", len(players), cap(players))
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

func updatePlayer(name string, player Player) (err error) {
	if err := db.Write("players", name, player); err != nil {
		return err
	}
	return nil
}

func deletePlayer(name string, player Player) (err error) {
	if err := db.Write("archive", name, player); err != nil {
		return err
	}
	if err := db.Delete("players", name); err != nil {
		return err
	}
	return nil
}
