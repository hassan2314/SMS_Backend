import dotenv from "dotenv";
import app from "./app.js"; 

dotenv.config({ path: "./db/prisma/.env" });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
