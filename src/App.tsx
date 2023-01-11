import { Box, MantineProvider } from "@mantine/core";
import DateTimePicker from "./components/DateTimePicker";

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Box p="md">
        <DateTimePicker
          label="Date Time Picker"
          placeholder="Pick date time"
          defaultValue={new Date()}
        />
      </Box>
    </MantineProvider>
  );
}

export default App;
