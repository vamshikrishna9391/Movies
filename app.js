const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "./moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running At http://localhost:3001");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

// calling initializeDBAndServer()
initializeDBAndServer();

//Function To Converting Results snack_case >>> camelCase

const convertingResultsToCamelCase = (dbResults) => {
  return {
    movieId: dbResults.movie_id,
    directorId: dbResults.director_id,
    movieName: dbResults.movie_name,
    leadActor: dbResults.lead_actor,
  };
};

// API 1. GET ALl Movies List

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        movie_name AS movieName
    FROM 
        movie
    ORDER BY 
        movie_id
    `;
  const arrOfMovies = await db.all(getMoviesQuery);

  response.send(arrOfMovies);
});

// API 2. POST A Movie

app.post("/movies/", async (request, response) => {
  const givenMovieDetails = request.body;
  const { directorId, movieName, leadActor } = givenMovieDetails;
  const postMovieQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;

  const dbResponse = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3. GET a Movie Details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMoviesQuery = `
    SELECT 
        *
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};
    `;

  const dbResponse = await db.get(getMoviesQuery);
  const movieDetails = convertingResultsToCamelCase(dbResponse);
  response.send(movieDetails);
});

// API 4. PUT || Update a Movie Details

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const putMovieDetailsQuery = `
  UPDATE 
  movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE 
  movie_id = ${movieId};
  `;
  await db.run(putMovieDetailsQuery);
  response.send("Movie Details Updated");
});

// API 5. DELETE || delete a movie details

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
     movie
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Function To Converting Results snack_case >>> camelCase
const convertDBArr = (item) => {
  return {
    directorId: item.director_id,
    directorName: item.director_name,
  };
};

// API 6. GET ALl Directors List

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
        *
    FROM 
        director
    ORDER BY 
        director_id
    `;
  const arrOfDR = await db.all(getDirectorsQuery);

  let convertedArr = [];
  for (let i of arrOfDR) {
    convertedArr.push(convertDBArr(i));
  }

  response.send(convertedArr);
});

// API 7. GET all movies of a director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `
    SELECT 
        movie_name AS movieName
    FROM 
        movie
    WHERE 
        director_id = ${directorId}
    ORDER BY 
        movie_id
    `;
  const dbResponse = await db.all(getMoviesOfDirectorQuery);

  response.send(dbResponse);
});

module.exports = app;
