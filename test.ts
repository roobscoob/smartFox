import { Client } from "./src/client"
import "./global";
import { DefaultElement } from "typed-xml";

(async () => {
  const client = await Client.connect("lb-iss02-classic-prod.animaljam.com", 443);

  console.log("connected!");

  // client.socket.on("xmlMessage", m => console.log("S2C |> " + (m instanceof DefaultElement ? m.getName() : m.constructor.name)));
  // client.socket.on("jsonMessage", console.log);
  // client.socket.on("strMessage", console.log);
  // client.socket.on("close", () => console.log("S2C |> CLOSED"));
  // client.socket.on("error", e => console.log("Socket Error", e));

  console.log(await client.getRandomKey());

})()
