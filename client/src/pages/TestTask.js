import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Divider,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { API } from "aws-amplify";
import ListStarWarsUsers from "../ui/starwaruser/ListStarWarsUsers";
import CreateNewUser from "../ui/starwaruser/CreateNewUser";

function TestTask() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(async () => {
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
        // setError(error.message);
      }
    }
    setIsLoading(true);
    await getUsers();
    setIsLoading(false);
  }, []);

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
      // setError(error);
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
      // setError(error);
    }
  }
  async function updateUser(formData) {
    // console.log(formData);
    const id = formData.bestStarWarsPersonId;
    const apiName = "StarWarsAPI";
    const path = `/users/${id}`;
    const myInit = {
      body: {
        name: formData.name,
        data: formData.person,
      },
      headers: {},
    };
    try {
      const updatedUser = await API.put(apiName, path, myInit);
      //   console.log(updatedUser);
      setUsers((prevValue) =>
        prevValue.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
    } catch (error) {
      console.log(error);
      // setError(error);
    }
  }
  async function updateUser(formData) {
    // console.log(formData);
    const id = formData.bestStarWarsPersonId;
    const apiName = "StarWarsAPI";
    const path = `/users/${id}`;
    const myInit = {
      body: {
        name: formData.name,
        data: formData.person,
      },
      headers: {},
    };
    try {
      const updatedUser = await API.put(apiName, path, myInit);
      //   console.log(updatedUser);
      setUsers((prevValue) =>
        prevValue.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
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
        <Box component="div" m={1}>
          <Divider />
        </Box>
        <CreateNewUser
          createUser={createUser}
          usersTakenIds={users.map((user) =>
            parseInt(user.bestStarWarsPersonId)
          )}
        />
        <Box component="div" m={2}>
          <Divider />
        </Box>
        <Typography variant="h5" gutterBottom>
          List of created users.
        </Typography>
        {isLoading && <CircularProgress />}
        {users ? (
          <ListStarWarsUsers
            users={users}
            deleteUser={deleteUser}
            updateUser={updateUser}
          />
        ) : (
            <Typography variant="h6" gutterBottom>
              There aren't users yet.
            </Typography>
          )}
      </Container>
    </div>
  );
}

export default TestTask;
