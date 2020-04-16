package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"sort"
	"strings"
)

/*func player(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	readPlayers()
	playerID, err := strconv.Atoi(path.Base(r.URL.Path))
	if err != nil {
		log.Println(err)
	}
	for _, p := range players {
		if p.ID == playerID {
			fmt.Println(p)
			json.NewEncoder(w).Encode(p)
			break
		}
	}
}*/

func delete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("delete Player")
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	if err != nil {
		panic(err)
	}
	readPlayers()
	if err := deletePlayer(tmpPlayer.Name); err != nil {
		fmt.Println("Error while deleting player", err)
	}
	json.NewEncoder(w).Encode(tmpPlayer)
}

func allplayers(w http.ResponseWriter, r *http.Request) {
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

func createPlayer(w http.ResponseWriter, r *http.Request) {
	fmt.Println("createPlayer")
	w.Header().Set("Content-Type", "application/json")
	var player Player
	json.NewDecoder(r.Body).Decode(&player)
	player.Name = strings.Title(strings.ToLower(player.Name))
	readPlayers()
	//return if player exists
	for _, f := range players {
		if player.Name == f.Name {
			return
		}
	}
	//get highest id
	id := 0
	for _, f := range players {
		if f.ID > id {
			id = f.ID
		}
	}
	player.ID = id + 1

	if err := updatePlayer(player.Name, player); err != nil {
		fmt.Println("Error creating new player ", player.Name, " :", err)
	}
	json.NewEncoder(w).Encode(&player)
}

/*func setPoints(w http.ResponseWriter, r *http.Request) {
	fmt.Println("set Points")
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	fmt.Println("Tempplayer: ", tmpPlayer)
	if err != nil {
		panic(err)
	}
	readPlayers()
	for _, p := range players {
		if p.ID == tmpPlayer.ID {
			p.Score = append(p.Score, p.Points-tmpPlayer.Points)
			//no score
			if p.Points < tmpPlayer.Points {
				if tmpPlayer.Tries == 3 {
					p.Score = p.Score[:len(p.Score)-3]
					p.Score = append(p.Score, 0)
					p.Score = append(p.Score, 0)
					p.Score = append(p.Score, 0)
				} else if tmpPlayer.Tries == 2 {
					p.Score = p.Score[:len(p.Score)-2]
					p.Score = append(p.Score, 0)
					p.Score = append(p.Score, 0)
				} else {
					p.Score = p.Score[:len(p.Score)-1]
					p.Score = append(p.Score, 0)
				}
			}
			fmt.Println(p.Score)

			p.Points = tmpPlayer.Points
			p.Average = math.Round((float64((gameData.GameMode-p.Points))/float64(len(p.Score))*float64(3.00))*100) / 100
			if p.Points == 0 {
				p.Finished = true
			}
			p.Tries = tmpPlayer.Tries
			db.Write("players", p.Name, p)
			json.NewEncoder(w).Encode(p)
			break
		}
	}
}*/

/*func switchGame(w http.ResponseWriter, r *http.Request) {
	if gameData.GameMode == 501 {
		gameData.GameMode = 301
	} else {
		gameData.GameMode = 501
	}

	readPlayers()
	for _, p := range players {
		p.Points = gameData.GameMode
		db.Write("players", p.Name, p)
	}
}*/

func resetGame(w http.ResponseWriter, r *http.Request) {
	initGame()
}

func quitGame(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Shutting Down System. Goodbye.")
	cmd := exec.Command("halt")
	err := cmd.Run()
	if err != nil {
		log.Fatal(err)
	}
}

/*func setID(w http.ResponseWriter, r *http.Request) {
	fmt.Println("setID")
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	if err != nil {
		panic(err)
	}
	readPlayers()
	for _, p := range players {
		if p.Name == tmpPlayer.Name {
			p.ID = tmpPlayer.ID
			db.Write("players", p.Name, p)
		}
	}

}*/

func update(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var tmpPlayer Player
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&tmpPlayer)
	if err != nil {
		panic(err)
	}
	readPlayers()
	if err := updatePlayer(tmpPlayer.Name, tmpPlayer); err != nil {
		fmt.Println("Error", err)
	}
	json.NewEncoder(w).Encode(tmpPlayer)
}

/* ToDo: Save for later...maybe calc points in backend?
func updateGameData(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GameData UPDATE")
	w.Header().Set("Content-Type", "application/json")
	var gd GameData
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&gd)
	if err != nil {
		panic(err)
	}
	gameData.Double = gd.Double
	gameData.Triple = gd.Triple
	gameData.Round = gd.Round
	// Do Magic
	json.NewEncoder(w).Encode(gd)
}*/
