import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

let connectedClients = new Set();
io.on("connection", (socket) => {
  console.log("A user connected");
  connectedClients.add(socket);
  // Handle stock price request
  socket.on("stock", async (company_name) => {
    try {
      const getTicker = await axios.get(
        `https://api.polygon.io/v3/reference/tickers?search=${company_name}&active=true&apiKey=Ly1prvd1pRYLP6eqn6eu0pc7UK8VdwYq`
      );
      const ticker = getTicker.data.results[0].ticker;
      const options = {
        method: "GET",
        url: `https://realstonks.p.rapidapi.com/${ticker}`,
        headers: {
          "X-RapidAPI-Key":
            "25ad220f10msh8efa45310a070c6p1a029cjsn3a6be4c1eca8",
          "X-RapidAPI-Host": "realstonks.p.rapidapi.com",
        },
      };

      //   try {
      //     const response = await axios.request(options);
      //     console.log(response.data);
      //   } catch (error) {
      //     console.error(error);
      //   }
      // Fetch stock price from an API (e.g., Alpha Vantage, IEX Cloud)
      const response = await axios.request(options);
      const stockPrice = response.data.price;
      console.log("data:", stockPrice);

      // Emit the stock price to the client
      socket.emit("stock", {
        company_name,
        price: stockPrice,
        fetch_time: new Date(),
      });
    } catch (error) {
      console.error(
        `Error fetching stock price for ${company_name}:`,
        error.message
      );

      // Emit an error message to the client
      socket.emit("error", `Failed to fetch stock price for ${company_name}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// setInterval(async () => {
//   try {
//     const getTicker = await axios.get(
//       `https://api.polygon.io/v3/reference/tickers?search=${company_name}&active=true&apiKey=Ly1prvd1pRYLP6eqn6eu0pc7UK8VdwYq`
//     );

//     const ticker = getTicker.data.results[0].ticker;
//     const options = {
//       method: "GET",
//       url: `https://realstonks.p.rapidapi.com/${ticker}`,
//       headers: {
//         "X-RapidAPI-Key": "25ad220f10msh8efa45310a070c6p1a029cjsn3a6be4c1eca8",
//         "X-RapidAPI-Host": "realstonks.p.rapidapi.com",
//       },
//     };

//     const response = await axios.request(options);
//     const stockPrice = response.data.price;
//     console.log("Updated stock price:", stockPrice);

//     // Emit the updated stock price to all connected clients
//     io.emit("stock", { company_name, price: stockPrice });
//   } catch (error) {
//     console.error("Error updating stock price:", error.message);
//   }
// }, 5000);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
