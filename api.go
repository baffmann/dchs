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

	tmp := players[:0]
	for i := range players {
		if players[i].ID != tmpPlayer.ID {
			tmp = append(tmp, players[i])
		}
	}
	players = tmp

	fmt.Println("Player ", tmpPlayer.Name, " deleted!")
	json.NewEncoder(w).Encode(tmpPlayer)

	if err := db.Delete("players", tmpPlayer.Name); err != nil {
		fmt.Println("Error while deleting player", err)
	}
}

func sortPlayers() []Player {
	var tmpPlayers []Player
	for _, p := range players {
		tmpPlayers = append(tmpPlayers, p)
	}

	sort.Slice(tmpPlayers, func(i, j int) bool {
		return tmpPlayers[i].Order < tmpPlayers[j].Order
	})

	return tmpPlayers
}

func player(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	sortedPlayers := sortPlayers()
	json.NewEncoder(w).Encode(sortedPlayers)
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

	//get highest id
	//Todo: Sort and choose highest free id instead of highest id
	id := 0
	for _, f := range players {
		if f.ID > id {
			id = f.ID
		}
	}
	player.ID = id + 1

	players = append(players, player)

	fmt.Println("Player ", player.Name, " with id ", player.ID, " created!")

	json.NewEncoder(w).Encode(&player)

	if err := db.Write("players", player.Name, player); err != nil {
		fmt.Println("Error creating new player ", player.Name, " :", err)
		return
	}
}

func startGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tmp := players[:0]
	for i := range players {
		if players[i].Active == true {
			tmp = append(tmp, players[i])
		}
	}
	players = tmp
	//fmt.Println("New Playerlist: ", players)
	sortedPlayers := sortPlayers()
	json.NewEncoder(w).Encode(sortedPlayers)
}

func resetGame(w http.ResponseWriter, r *http.Request) {
	resetPlayers()
	json.NewEncoder(w).Encode("Game initialized")
}

func getSetting(w http.ResponseWriter, r *http.Request) {
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

	for i := range players {
		if tmpPlayer.ID == players[i].ID {
			players[i] = tmpPlayer
			json.NewEncoder(w).Encode(players[i])
			break
		}
	}

	if err := db.Write("players", tmpPlayer.Name, tmpPlayer); err != nil {
		fmt.Println("Error", err)
	}
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
