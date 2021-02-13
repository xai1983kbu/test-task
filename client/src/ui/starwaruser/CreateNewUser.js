import React from "react";
import {
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
  const {
    getValues,
    errors,
    handleSubmit,
    control,
    setError,
    trigger,
    formState: { isSubmitting, isValid },
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (data) => {
    try {
      const { bestStarWarsPersonId, username } = data;
      await createUser(bestStarWarsPersonId.toString(), username);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Створити Нового користувача
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <FormControl
            style={{ minWidth: 300 }}
            error={Boolean(errors.wordlevel)}
          >
            <InputLabel id="demo-simple-select-label">
              Вибір id героя
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
              rules={{ required: "Це поле обов'язкове" }}
              control={control}
              defaultValue=""
            />
            <FormHelperText>
              {errors.bestStarWarsPerson && errors.bestStarWarsPerson.message}
            </FormHelperText>
          </FormControl>
          <Controller
            as={
              <TextField
                fullWidth
                margin="none"
                id="outlined-username-input"
                label="Ім'я користувача"
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
              required: "Це поле обов'язкове",
              minLength: {
                value: 3,
                message: "Ім'я користувача повинно містити мінімум 3 символів",
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
            // disabled={isSubmitting || !isValid}
            //   className={classes.buttonText}
          >
            Створити користувача
          </Button>
        </div>
      </form>
    </div>
  );
}
