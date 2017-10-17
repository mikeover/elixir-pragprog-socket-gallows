import {Socket} from "phoenix"

export default class HangmanServer {
  constructor(tally) {
    this.tally = tally
    this.socket = new Socket("/socket", {})
    this.socket.connect()
  }

  connect_to_hangman() {
    this.setup_channel()
    this.channel
      .join()
      .receive("ok", resp => {
        console.log("connected")
        this.fetch_tally()
      })
      .receive("error", resp => {
        alert("Unable to join", resp)
        throw(resp)
      })
  }

  setup_channel() {
    this.channel = this.socket.channel("hangman:game", {difficulty: "easy"})
    this.channel.on("tally", (tally) => {
      this.copy_tally(tally)
    })
    this.channel.on("time_remaining", (resp) => {
      this.tally["time_remaining"] = resp.seconds_remaining
    })
  }

  fetch_tally() {
    this.channel.push("tally", {})
  }

  make_move(guess) {
    this.channel.push("make_move", guess)
  }

  new_game(difficulty) {
    this.channel.push("new_game", {difficulty: difficulty})
  }

  copy_tally(from) {
    for (let k in from) {
      this.tally[k] = from[k]
    }
  }
}
