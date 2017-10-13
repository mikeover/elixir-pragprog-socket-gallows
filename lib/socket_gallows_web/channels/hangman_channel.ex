defmodule SocketGallowsWeb.HangmanChannel do
  require Logger
  use Phoenix.Channel

  def join("hangman:game", _, socket) do
    game = Hangman.new_game()
    Process.send_after(self(), {:tick, 59}, 1000)
    socket = assign(socket, :game, game)
    { :ok, socket }
  end

  def handle_in("tally", _args, socket) do
    tally = socket.assigns.game |> Hangman.tally
    push(socket, "tally", tally)
    { :noreply, socket }
  end

  def handle_in("make_move", guess, socket) do
    tally = socket.assigns.game |> Hangman.make_move(guess)
    push(socket, "tally", tally)
    { :noreply, socket }
  end

  def handle_in("new_game", _args, socket) do
    Process.send_after(self(), {:tick, 59}, 1000)
    socket = socket |> assign(:game, Hangman.new_game())
    handle_in("tally", nil, socket)
  end

  def handle_in(unhandled_msg, _args, socket) do
    Logger.error("Unhandled message '#{unhandled_msg}'")
    { :noreply, socket }
  end

  def handle_info({:tick, seconds_remaining}, socket) when seconds_remaining < 0 do
    tally = socket.assigns.game |> Hangman.tally
    tally = put_in(tally.game_state, "lost-out of time")
    push(socket, "tally", tally)
    { :noreply, socket }
  end

  def handle_info({:tick, seconds_remaining}, socket) do
    tally = socket.assigns.game |> Hangman.tally
    handle_tick(tally.game_state, seconds_remaining, socket)
    { :noreply, socket }
  end

  def handle_tick(:won, _, _), do: nil
  def handle_tick(:lost, _, _), do: nil
  def handle_tick(_game_state, seconds_remaining, socket) do
    push(socket, "time_remaining", %{seconds_remaining: seconds_remaining})
    Process.send_after(self(), {:tick, seconds_remaining - 1}, 1000)
  end
end
