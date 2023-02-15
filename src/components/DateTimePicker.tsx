import dayjs from 'dayjs'
import React, { useState, useRef, forwardRef, useEffect } from 'react'
import { useUncontrolled, useMergedRef, upperFirst } from '@mantine/hooks'
import {
	useMantineTheme,
	useComponentDefaultProps,
	Group,
	Button
} from '@mantine/core'
import {
	Calendar,
	DatePickerBase,
	DatePickerBaseSharedProps,
	TimeInput
} from '@mantine/dates'
import { CalendarSharedProps } from '@mantine/dates/lib/components/CalendarBase/CalendarBase'
import { FirstDayOfWeek } from '@mantine/dates/lib/types'
import { IconClock } from '@tabler/icons'

export interface DateTimePickerProps
	extends Omit<DatePickerBaseSharedProps, 'onChange'>,
		Omit<
			CalendarSharedProps,
			| 'size'
			| 'classNames'
			| 'styles'
			| 'onMonthChange'
			| 'onChange'
			| 'isDateInRange'
			| 'isDateFirstInRange'
			| 'isDateLastInRange'
			| 'month'
		> {
	/** Selected date, required with controlled input */
	value?: Date | null

	/** Called when date changes */
	onChange?(value: Date | null): void

	/** Default value for uncontrolled input */
	defaultValue?: Date | null

	/** Set to true to open dropdown on clear */
	openDropdownOnClear?: boolean

	/** dayjs input format */
	inputFormat?: string

	/** Control initial dropdown opened state */
	initiallyOpened?: boolean

	/** Parser function for date provided by input typing */
	dateParser?: (value: string) => Date

	/** Input name, useful for uncontrolled variant to capture data with native form */
	name?: string

	/** Set first day of the week */
	firstDayOfWeek?: FirstDayOfWeek

	/** Allow free input */
	allowFreeInput?: boolean

	/** Render day based on the date */
	renderDay?(date: Date): React.ReactNode

	/** Hide now button so that it doesn't interfear with min or max date */
	hideNow?: boolean

	/** Hide now button when date is disabled */
	autoHideNow?: boolean
}

const defaultProps: Partial<DateTimePickerProps> = {
	shadow: 'sm',
	transitionDuration: 200,
	labelFormat: 'MMMM YYYY',
	initiallyOpened: false,
	name: 'date',
	size: 'sm',
	dropdownType: 'popover',
	dropdownPosition: 'flip',
	clearable: true,
	disabled: false,
	fixOnBlur: true,
	withinPortal: false,
	firstDayOfWeek: 'monday',
	openDropdownOnClear: false,
	hideNow: false,
	autoHideNow: true
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
	(props: DateTimePickerProps, ref) => {
		const {
			value,
			onChange,
			defaultValue,
			classNames,
			styles,
			shadow,
			locale,
			inputFormat,
			transitionDuration,
			transitionTimingFunction,
			nextMonthLabel,
			previousMonthLabel,
			labelFormat,
			dayClassName,
			dayStyle,
			disableOutsideEvents,
			minDate,
			maxDate,
			excludeDate,
			initialMonth,
			initiallyOpened,
			name,
			size,
			dropdownType,
			dropdownPosition,
			clearable,
			disabled,
			clearButtonLabel,
			fixOnBlur,
			allowFreeInput,
			withinPortal,
			dateParser,
			firstDayOfWeek,
			onFocus,
			onBlur,
			amountOfMonths,
			allowLevelChange,
			initialLevel,
			onDropdownClose,
			onDropdownOpen,
			hideOutsideDates,
			hideWeekdays,
			renderDay,
			type,
			openDropdownOnClear,
			unstyled,
			weekendDays,
			yearLabelFormat,
			nextDecadeLabel,
			nextYearLabel,
			previousDecadeLabel,
			previousYearLabel,
			hideNow,
			autoHideNow,
			...others
		} = useComponentDefaultProps('DatePicker', defaultProps, props)

		const theme = useMantineTheme()
		const finalLocale = locale || theme.datesLocale
		const dateFormat = inputFormat ?? 'DD/MM/YYYY hh:mm a'
		const [dropdownOpened, setDropdownOpened] = useState(initiallyOpened)
		const calendarSize = size === 'lg' || size === 'xl' ? 'md' : 'sm'
		const inputRef = useRef<HTMLInputElement | null>(null)
		const [lastValidValue, setLastValidValue] = useState(defaultValue ?? null)
		const [_value, setValue] = useUncontrolled<Date | null>({
			value,
			defaultValue,
			finalValue: null,
			onChange
		})
		const [calendarMonth, setCalendarMonth] = useState(
			_value || initialMonth || new Date()
		)

		const [focused, setFocused] = useState(false)
		const [inputState, setInputState] = useState(
			_value instanceof Date
				? upperFirst(dayjs(_value).locale(finalLocale).format(dateFormat))
				: ''
		)
		const [_hideNow, setHideNow] = useState(hideNow)

		const closeDropdown = () => {
			setDropdownOpened(false)
			onDropdownClose?.()
		}

		const openDropdown = () => {
			setDropdownOpened(true)
			onDropdownOpen?.()
		}

		useEffect(() => {
			if (value === null && !focused) {
				setInputState('')
			}

			if (value instanceof Date && !focused) {
				setInputState(
					upperFirst(dayjs(value).locale(finalLocale).format(dateFormat))
				)
			}
		}, [value, focused, finalLocale, dateFormat])

		const handleValueChange = (date: Date) => {
			setValue(date)
			setInputState(
				upperFirst(dayjs(date).locale(finalLocale).format(dateFormat))
			)
			window.setTimeout(() => inputRef.current?.focus(), 0)
		}

		const handleClear = () => {
			setValue(null)
			setLastValidValue(null)
			setInputState('')
			openDropdownOnClear && openDropdown()
			inputRef.current?.focus()
		}

		const parseDate = (date: string) =>
			dateParser
				? dateParser(date)
				: dayjs(date, dateFormat, finalLocale).toDate()

		const setDateFromInput = () => {
			let date = typeof _value === 'string' ? parseDate(_value) : _value

			if (maxDate && dayjs(date).isAfter(maxDate)) {
				date = maxDate
			}

			if (minDate && dayjs(date).isBefore(minDate)) {
				date = minDate
			}

			if (date && dayjs(date).isValid()) {
				setValue(date)
				setLastValidValue(date)
				setInputState(
					upperFirst(dayjs(date).locale(finalLocale).format(dateFormat))
				)
				setCalendarMonth(date)
			} else if (fixOnBlur) {
				setValue(lastValidValue)
			}
		}

		const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
			typeof onBlur === 'function' && onBlur(event)
			setFocused(false)

			if (allowFreeInput) {
				setDateFromInput()
			}
		}

		const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'Enter' && allowFreeInput) {
				closeDropdown()
				setDateFromInput()
			}
		}

		const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
			typeof onFocus === 'function' && onFocus(event)
			setFocused(true)
		}

		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			openDropdown()

			const date = parseDate(event.target.value)
			if (dayjs(date).isValid()) {
				setValue(date)
				setLastValidValue(date)
				setInputState(event.target.value)
				setCalendarMonth(date)
			} else {
				setInputState(event.target.value)
			}
		}

		const handleNow = () => {
			const now = new Date()
			setValue(now)
			setInputState(
				upperFirst(dayjs(value).locale(finalLocale).format(dateFormat))
			)
			setDropdownOpened(false)
			window.setTimeout(() => inputRef.current?.focus(), 0)
			onChange?.(now)
		}

		const handleOk = () => {
			setInputState(
				upperFirst(dayjs(_value).locale(finalLocale).format(dateFormat))
			)
			setDropdownOpened(false)
			window.setTimeout(() => inputRef.current?.focus(), 0)
			onChange?.(_value)
		}

		const combineTimeAndDate = (time: Date, date: Date): Date => {
			if (!(time instanceof Date)) return date

			const hour = dayjs(time).hour()
			const minute = dayjs(time).minute()
			const dateAndTime = dayjs(date).hour(hour).minute(minute)
			//@ts-ignore
			return dateAndTime.$d
		}

		useEffect(() => {
			if (hideNow || !autoHideNow) return

			if (
				(minDate && dayjs(new Date()).isBefore(minDate)) ||
				(maxDate && dayjs(new Date()).isAfter(maxDate))
			) {
				setHideNow(true)
			} else {
				setHideNow(false)
			}
		}, [hideNow, autoHideNow, minDate, maxDate])

		return (
			<DatePickerBase
				allowFreeInput={allowFreeInput}
				dropdownOpened={dropdownOpened ?? false}
				setDropdownOpened={setDropdownOpened}
				shadow={shadow}
				transitionDuration={transitionDuration}
				ref={useMergedRef(ref, inputRef)}
				size={size}
				styles={styles}
				classNames={classNames}
				onChange={handleChange}
				onBlur={handleInputBlur}
				onFocus={handleInputFocus}
				onKeyDown={handleKeyDown}
				name={name}
				inputLabel={inputState}
				__staticSelector="DatePicker"
				dropdownType={dropdownType}
				dropdownPosition={dropdownPosition}
				clearable={type === 'date' ? false : clearable && !!_value && !disabled}
				clearButtonLabel={clearButtonLabel}
				onClear={handleClear}
				disabled={disabled}
				withinPortal={withinPortal}
				amountOfMonths={amountOfMonths}
				onDropdownClose={onDropdownClose}
				onDropdownOpen={onDropdownOpen}
				type={type}
				unstyled={unstyled}
				{...others}
			>
				<Calendar
					classNames={classNames}
					styles={styles}
					locale={finalLocale}
					nextMonthLabel={nextMonthLabel}
					previousMonthLabel={previousMonthLabel}
					month={allowFreeInput ? calendarMonth : undefined}
					initialMonth={
						initialMonth || (_value instanceof Date ? _value : new Date())
					}
					onMonthChange={setCalendarMonth}
					value={_value instanceof Date ? _value : dayjs(_value).toDate()}
					onChange={handleValueChange}
					labelFormat={labelFormat}
					dayClassName={dayClassName}
					dayStyle={dayStyle}
					disableOutsideEvents={disableOutsideEvents}
					minDate={minDate}
					maxDate={maxDate}
					excludeDate={excludeDate}
					__staticSelector="DatePicker"
					fullWidth={dropdownType === 'modal'}
					__stopPropagation={dropdownType !== 'modal'}
					size={dropdownType === 'modal' ? 'lg' : calendarSize}
					firstDayOfWeek={firstDayOfWeek}
					preventFocus={allowFreeInput}
					amountOfMonths={amountOfMonths}
					allowLevelChange={allowLevelChange}
					initialLevel={initialLevel}
					hideOutsideDates={hideOutsideDates}
					hideWeekdays={hideWeekdays}
					renderDay={renderDay}
					unstyled={unstyled}
					weekendDays={weekendDays}
					yearLabelFormat={yearLabelFormat}
					nextDecadeLabel={nextDecadeLabel}
					nextYearLabel={nextYearLabel}
					previousDecadeLabel={previousDecadeLabel}
					previousYearLabel={previousYearLabel}
				/>
				<Group align="center" mt={12} spacing="xs">
					{!_hideNow && (
						<Button sx={{ flexGrow: 1 }} variant="light" onClick={handleNow}>
							Now
						</Button>
					)}
					<TimeInput
						icon={<IconClock size={18} />}
						sx={{ flexGrow: 1 }}
						disabled={!_value}
						value={_value}
						onChange={(value) => {
							setValue(combineTimeAndDate(value, _value!))
						}}
						format={dateFormat.match(/ a$/i) ? '12' : '24'}
					/>
					<Button sx={{ flexGrow: 1 }} onClick={handleOk}>
						Ok
					</Button>
				</Group>
			</DatePickerBase>
		)
	}
)

export default DateTimePicker
