import { useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import { API } from "aws-amplify";
import ListStarWarsUsers from "../ui/starwaruser/ListStarWarsUsers";
import CreateNewUser from "../ui/starwaruser/CreateNewUser";

function TestTask() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const apiName = "StarWarsAPI";
    const path = "/users";
    const myInit = {};
    try {
      const starWarsUsers = await API.get(apiName, path, myInit);
      console.log(starWarsUsers);
      setUsers(starWarsUsers);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  }

  async function createUser(id, name) {
    console.log(id, name);
    const apiName = "StarWarsAPI";
    const path = "/users";
    const myInit = {
      body: {
        id,
        name,
      },
      headers: {},
    };
    try {
      const user = await API.post(apiName, path, myInit);
      console.log(user);
      setUsers((prevValue) => [...prevValue, user]);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  }
  async function deleteUser(user) {
    const apiName = "StarWarsAPI";
    const id = user.bestStarWarsPersonId;
    const path = `/users/${id}`;
    const myInit = {
      body: {},
      headers: {},
    };
    try {
      const resp = await API.del(apiName, path, myInit);
      console.log(resp);
      setUsers(users.filter((user) => user.bestStarWarsPersonId !== id));
    } catch (error) {
      console.log(error);
      setError(error);
    }
  }
  return (
    <div className="App">
      <Container maxWidth="xs" style={{ textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          {error}
        </Typography>
        <CreateNewUser
          createUser={createUser}
          usersTakenIds={users.map((user) =>
            parseInt(user.bestStarWarsPersonId)
          )}
        />
        <Typography variant="h6" gutterBottom>
          Перелік створених користувачів
        </Typography>
        {users ? (
          <ListStarWarsUsers users={users} deleteUser={deleteUser} />
        ) : (
          <Typography variant="h6" gutterBottom>
            Немає створених користувачів
          </Typography>
        )}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => createUser("15", "Deniel")}
        >
          Створити Нового Користувача
        </Button> */}
      </Container>
    </div>
  );
}

export default TestTask;
