import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

export default function CreateNewUser({ createUser, usersTakenIds }) {
  const { errors, handleSubmit, control, reset } = useForm({
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      const { bestStarWarsPersonId, username } = data;
      await createUser(bestStarWarsPersonId.toString(), username);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Create a New User
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <FormControl
            style={{ minWidth: 300 }}
            error={Boolean(errors.wordlevel)}
          >
            <InputLabel id="demo-simple-select-label">
              Choose id Person from StarWars api
            </InputLabel>

            <Controller
              as={
                <Select>
                  {[...Array(83).keys()].map(
                    (id) =>
                      !usersTakenIds.includes(id + 1) && (
                        <MenuItem key={id + 1} value={id + 1}>
                          {id + 1}
                        </MenuItem>
                      )
                  )}
                </Select>
              }
              name="bestStarWarsPersonId"
              rules={{ required: "This field is required!" }}
              control={control}
              defaultValue=""
            />
            <FormHelperText>
              {errors.bestStarWarsPerson && errors.bestStarWarsPerson.message}
            </FormHelperText>
          </FormControl>
          <Box component="div" m={2} />
          <Controller
            as={
              <TextField
                fullWidth
                margin="none"
                id="outlined-username-input"
                label="Name of user"
                type="text"
                variant="outlined"
                error={!!errors?.username}
                helperText={<ErrorMessage errors={errors} name="username" />}
              />
            }
            control={control}
            name="username"
            defaultValue=""
            rules={{
              required: "This field is required!",
              minLength: {
                value: 3,
                message: "User's name must contain min 3 charachters",
              },
            }}
          />
          <Button
            id="create"
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="primary"
          >
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
