import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", routes);

// Iniciar servidor
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
