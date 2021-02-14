import React from "react";
import { withTheme } from "@rjsf/core";
import { Theme as MaterialUITheme } from "@rjsf/material-ui";
import { Container } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const Form = withTheme(MaterialUITheme);

const schema = {
  type: "object",
  title: "Profile",
  properties: {
    name: {
      type: "string",
      title: "Username",
      //   description: "Name of user",
    },
    person: {
      type: "object",
      title: "user's data",
      properties: {
        birth_year: {
          type: "string",
        },
        created: {
          type: "string",
        },
        edited: {
          type: "string",
        },
        eye_color: {
          type: "string",
        },
        films: {
          type: "array",
          items: {
            type: "string",
          },
        },
        gender: {
          type: "string",
        },
        hair_color: {
          type: "string",
        },
        height: {
          type: "string",
        },
        homeworld: {
          type: "string",
        },
        mass: {
          type: "string",
        },
        name: {
          type: "string",
        },
        skin_color: {
          type: "string",
        },
        species: {
          type: "array",
          items: {
            type: "string",
          },
        },
        length: {
          type: "number",
        },
        starships: {
          type: "array",
          items: {
            type: "string",
          },
        },
        url: {
          type: "string",
        },
        vehicles: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  },
  required: ["name"],
};

function EditUser({ user, editFormOpen, setEditFormOpen, updateUser }) {
  async function handleSubmit(e) {
    try {
      const formData = e.formData;
      //   console.log(formData);
      await updateUser(formData);
      setEditFormOpen(false);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Dialog
      open={editFormOpen}
      onClose={() => setEditFormOpen(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{`Edit profile of user with id = ${user.bestStarWarsPersonId}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>Form for editing an existing user</DialogContentText>
        <div></div>
        <Container maxWidth="md" style={{ textAlign: "center" }}>
          <Form
            schema={schema}
            formData={user}
            onSubmit={(e) => handleSubmit(e)}
          />
        </Container>
      </DialogContent>
    </Dialog>
  );
}

export default EditUser;
