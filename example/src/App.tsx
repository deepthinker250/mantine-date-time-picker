//@ts-ignore
import { DateTimePicker } from 'mantine-datetime-picker'

function App() {
	return (
		<DateTimePicker
			label="Mantine DateTime Picker"
			placeholder="Pick date time"
			defaultValue={new Date()}
		/>
	)
}

export default App
