const RESPONSES = {
  won: ["success", "You Won!"],
  lost: [ "danger", "You Lost!" ],
  good_guess: ["success", "Good guess!" ],
  bad_guess: ["warning", "Bad guess!" ],
  already_guessed: ["info", "You already guessed that"],
  initializing: ["info", "Let's Play!"],
  "lost-out of time": ["danger", "You ran out of time!"]
}

import HangmanServer from "./hangman_socket.js"

let view = function(hangman) {
  let app = new Vue({
    el: "#app",
    data: {
      tally: hangman.tally
    },
    computed: {
      game_over: function() {
        let state = this.tally.game_state
        return (state == "won") || (state == "lost") || (state == "lost-out of time")
      },
      game_state_message: function() {
        let state = this.tally.game_state
        return RESPONSES[state][1]
      },
      game_state_class: function() {
        let state = this.tally.game_state
        return RESPONSES[state][0]
      }
    },
    methods: {
      guess: function(ch) {
        if (!this.game_over) {
          hangman.make_move(ch)
        }
      },
      new_game: function(difficulty) {
        hangman.new_game(difficulty)
      },
      already_guessed: function(ch) {
        return this.tally.letters_used.indexOf(ch) >= 0
      },
      correct_guess: function(ch) {
        return this.already_guessed(ch) &&
          (this.tally.letters.indexOf(ch) >= 0)
      },
      turns_gt: function(left) {
        return (this.tally.turns_allowed - this.tally.turns_left) < left
      }
    },
    mounted() {
      window.addEventListener("keypress", function(e) {
        this.guess(String.fromCharCode(e.keyCode));
      }.bind(this));
    }
  })
  return app;
}

window.onload = function() {
  let tally = {
    turns_left: 10,
    letters: ["_", "_", "_"],
    game_state: "initializing",
    letters_used: [],
    time_remaining: 60,
    difficulty: "easy",
    turns_allowed: 10
  }

  let hangman = new HangmanServer(tally)
  let app = view(hangman)

  hangman.connect_to_hangman()
}
