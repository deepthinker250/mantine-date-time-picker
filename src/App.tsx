import React from 'react'
import { Box, MantineProvider } from '@mantine/core'
import DateTimePicker from './components/DateTimePicker'
import dayjs from 'dayjs'

function App() {
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS>
			<Box p="md">
				<DateTimePicker
					withAsterisk
					label="Date Time Picker"
					placeholder="Pick date time"
					defaultValue={new Date()}
					//autoHideNow={false}
					minDate={dayjs(new Date()).subtract(6, 'days').toDate()}
					maxDate={dayjs(new Date()).add(6, 'days').toDate()}
				/>
			</Box>
		</MantineProvider>
	)
}

export default App
