import { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import EditUser from "./EditUser";
export default function ListStarWarsUsers({ users, deleteUser, updateUser }) {
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [userForEdit, setUserForEdit] = useState({});
  return (
    <>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.name}
              secondary={`User with id = ${user.bestStarWarsPersonId}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => {
                  setUserForEdit(user);
                  setEditFormOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteUser(user)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <EditUser
        user={userForEdit}
        editFormOpen={editFormOpen}
        setEditFormOpen={setEditFormOpen}
        updateUser={updateUser}
      />
    </>
  );
}
