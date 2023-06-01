// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    env,
    net::SocketAddr,
};

use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{future, pin_mut, StreamExt, stream::TryStreamExt};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;

use tauri::State;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

struct ClientsConnection {
  clients: PeerMap
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn start_server(shared_state: State<ClientsConnection>) -> bool {
  println!("React command received!");
  tauri::async_runtime::spawn(setup_server(shared_state.clients.clone()));
  true.into()
}

async fn setup_server(state: PeerMap) {
  let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:7896".to_string());
  
  // Create the event loop and TCP listener we'll accept connections on.
  let try_socket = TcpListener::bind(&addr).await;
  let listener = try_socket.expect("Failed to bind");
  println!("Listening on: {}", addr);

  // Let's spawn the handling of each connection in a separate task.
  while let Ok((stream, _)) = listener.accept().await {
    tokio::spawn(handle_connection(state.clone(), stream));
  }
}

async fn handle_connection(peer_map: PeerMap, stream: TcpStream) {
  let addr = stream.peer_addr().expect("connected streams should have a peer address");
    println!("Peer address: {}", addr);

  let ws_stream = tokio_tungstenite::accept_async(stream)
    .await
    .expect("Error during the websocket handshake occurred");

  println!("New WebSocket connection: {}", addr);

  // Insert the write part of this peer to the peer map.
  let (tx, rx) = unbounded();
  peer_map.lock().unwrap().insert(addr, tx);
  
  let (outgoing, incoming) = ws_stream.split();

  let broadcast_incoming = incoming.try_for_each(|msg| {
    println!("Received a message from {}: {}", addr, msg.to_text().unwrap());
    let peers = peer_map.lock().unwrap();

    // We want to broadcast the message to everyone except ourselves.
    let brodcast_recipients = peers.iter().filter(|(peer_addr, _)| peer_addr != &&addr).map(|(_, ws_sink)| ws_sink);

    for recepient in brodcast_recipients {
      recepient.unbounded_send(msg.clone()).unwrap();
    }

    future::ok(())
  });

  let receive_from_others = rx.map(Ok).forward(outgoing);

  pin_mut!(broadcast_incoming, receive_from_others);
  future::select(broadcast_incoming, receive_from_others).await;

  println!("{} disconnected", addr);
  peer_map.lock().unwrap().remove(&addr);
}

#[tauri::command]
fn send_server_message(
    binary_array: Vec<u8>,
    shared_state: State<ClientsConnection>,
) {
  // Convert the message to a WebSocket text message.
  let binary_message = Message::Binary(binary_array);

  // Send the message to all connected clients.
  let connected_clients_state = shared_state.clients.lock().unwrap();
  let connected_clients = connected_clients_state.iter().map(|(_, ws_sink)| ws_sink);

  for client in connected_clients {
    client.unbounded_send(binary_message.clone()).unwrap();
  }
}

fn main() {
  // let (message_sender, _) = broadcast::channel::<Message>();
  // let connected_clients_state = PeerMap::new(Mutex::new(HashMap::new()));

  // tauri::async_runtime::spawn(start_server());
  tauri::Builder::default()
    .plugin(tauri_plugin_websocket::init())
    .manage(ClientsConnection { clients: Default::default() })
    .invoke_handler(tauri::generate_handler![
      start_server,
      send_server_message
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

}
