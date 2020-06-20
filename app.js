const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const apiResponse = require("./helpers/apiResponse");
const apiRouter = require("./routes/api");
const mdtohtmlRouter = require("./routes/mdtohtml");
const imageRouter = require("./routes/images");
const fileUpload = require("express-fileupload");
const cors = require("cors");

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require("mongoose");
mongoose
	.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		//don't show the log when it is test
		if (process.env.NODE_ENV !== "test") {
			console.log("Connected to %s", MONGODB_URL);
			console.log(`App is running on port http://localhost:${process.env.PORT} `);
		}
	})
	.catch((err) => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
const db = mongoose.connection;

const app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
	fileUpload({
		limits: { fileSize: 10 * 1024 * 1024 },
		abortOnLimit: true,
	})
);

//To allow cross-origin requests
app.use(cors());

//Route Prefixes

app.use("/api", apiRouter);
app.use("/api/v1/mdtohtml", mdtohtmlRouter);
app.use("/api/v1/images", imageRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
	return apiResponse.notFoundResponse(res, "URL not found");
});

app.use((err, req, res) => {
	if (err.name == "UnauthorizedError") {
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = app;
