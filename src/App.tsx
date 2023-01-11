import { Button, MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Button>Button</Button>
    </MantineProvider>
  );
}

export default App;
