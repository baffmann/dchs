package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sort"
	"strings"
)

func delete(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	if err != nil {
		panic(err)
	}
	if err := db.Write("archive", tmpPlayer.Name, tmpPlayer); err != nil {
		fmt.Println("Error while deleting player", err)
	}
	if err := db.Delete("players", tmpPlayer.Name); err != nil {
		fmt.Println("Error while deleting player", err)
	}
	readArchive()
	fmt.Println("Player ", tmpPlayer.Name, " deleted!")
	json.NewEncoder(w).Encode(tmpPlayer)
}

func player(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	readPlayers()

	var tmpPlayers []Player
	for _, p := range players {
		tmpPlayers = append(tmpPlayers, p)
	}

	sort.Slice(tmpPlayers, func(i, j int) bool {
		return tmpPlayers[i].Order < tmpPlayers[j].Order
	})

	json.NewEncoder(w).Encode(tmpPlayers)
}

func create(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var player Player
	json.NewDecoder(r.Body).Decode(&player)
	player.Name = strings.Title(strings.ToLower(player.Name))
	//return if player exists
	for _, f := range players {
		if player.Name == f.Name {
			return
		}
	}
	for _, arcPlayer := range archive {
		if player.Name == arcPlayer.Name {
			player = arcPlayer
		}
	}

	//get highest id
	//Todo: Sort and choose highest free id instead of highest id
	id := 0
	for _, f := range players {
		if f.ID > id {
			id = f.ID
		}
	}
	player.ID = id + 1

	if err := db.Write("players", player.Name, player); err != nil {
		fmt.Println("Error creating new player ", player.Name, " :", err)
		return
	}
	fmt.Println("Player ", player.Name, " with id ", player.ID, " created!")

	json.NewEncoder(w).Encode(&player)
}

func resetGame(w http.ResponseWriter, r *http.Request) {
	initGame()
	json.NewEncoder(w).Encode(settings)
}

func quitGame(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Shutting Down System. Goodbye.")
	cmd := exec.Command("feierabend.sh")
	cmd.Stderr = os.Stdout
	cmd.Stdout = os.Stdout
	err := cmd.Run()
	if err != nil {
		log.Fatal(err)
	}
}

func update(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	if err != nil {
		panic(err)
	}
	if err := db.Write("players", tmpPlayer.Name, tmpPlayer); err != nil {
		fmt.Println("Error", err)
	}
	json.NewEncoder(w).Encode(tmpPlayer)
}

func newSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&settings)
	if err != nil {
		panic(err)
	}
	if err := updateSettings(settings); err != nil {
		fmt.Println("Error", err)
	}
	json.NewEncoder(w).Encode(settings)
}
