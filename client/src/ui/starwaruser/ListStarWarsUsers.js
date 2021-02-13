import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
export default function ListStarWarsUsers({ users, deleteUser }) {
  return (
    <List>
      {users.map((user) => (
        <ListItem key={user.id}>
          <ListItemText
            primary={user.name}
            secondary={`Herro id = ${user.bestStarWarsPersonId}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="edit">
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
  );
}
