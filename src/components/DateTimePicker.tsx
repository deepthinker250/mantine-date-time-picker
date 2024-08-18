import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import {
  ActionIcon,
  ActionIconProps,
  BoxProps,
  CheckIcon,
  factory,
  Factory,
  InputVariant,
  StylesApiProps,
  useProps,
  useResolvedStylesApi,
  useStyles,
} from '@mantine/core';
import { assignTime, CalendarBaseProps, CalendarSettings, CalendarStylesNames, DateInputSharedProps, DatePicker, DateValue, pickCalendarProps, PickerInputBase, PickerInputBaseStylesNames, shiftTimezone, TimeInput, TimeInputProps, useDatesContext } from '@mantine/dates';
import { useDidUpdate, useDisclosure, useMergedRef } from '@mantine/hooks';
import React from 'react';
import { useUncontrolledDates } from './useControlledDates';

export type DateTimePickerStylesNames =
  | 'timeWrapper'
  | 'timeInput'
  | 'submitButton'
  | PickerInputBaseStylesNames
  | CalendarStylesNames;

export interface DateTimePickerProps
  extends BoxProps,
    Omit<
      DateInputSharedProps,
      'classNames' | 'styles' | 'closeOnChange' | 'size' | 'valueFormatter'
    >,
    Omit<CalendarBaseProps, 'defaultDate'>,
    Omit<CalendarSettings, 'onYearMouseEnter' | 'onMonthMouseEnter'>,
    StylesApiProps<DateTimePickerFactory> {
  /** Dayjs format to display input value, "DD/MM/YYYY HH:mm" by default  */
  valueFormat?: string;

  /** Controlled component value */
  value?: DateValue;

  /** Default value for uncontrolled component */
  defaultValue?: DateValue;

  /** Called when value changes */
  onChange?: (value: DateValue) => void;

  /** TimeInput component props */
  timeInputProps?: TimeInputProps & { ref?: React.ComponentPropsWithRef<'input'>['ref'] };

  /** Props passed down to the submit button */
  submitButtonProps?: ActionIconProps & React.ComponentPropsWithoutRef<'button'>;

  /** Determines whether seconds input should be rendered */
  withSeconds?: boolean;
}

export type DateTimePickerFactory = Factory<{
  props: DateTimePickerProps;
  ref: HTMLButtonElement;
  stylesNames: DateTimePickerStylesNames;
  variant: InputVariant;
}>;

const defaultProps: Partial<DateTimePickerProps> = {
  dropdownType: 'popover',
};

const classes: Record<string, string> = {
  timeWrapper: `{
    display: 'flex',
    alignItems: 'stretch',
    marginTop: 'var(--mantine-spacing-md)'
  }`,
  timeInput: `{
    flex: 1,
    marginInlineEnd: 'var(--mantine-spacing-md)'
  }`
}

const DateTimePicker = factory<DateTimePickerFactory>((_props, ref) => {
  const props = useProps('DateTimePicker', defaultProps, _props);
  const {
    value,
    defaultValue,
    onChange,
    valueFormat,
    locale,
    classNames,
    styles,
    unstyled,
    timeInputProps,
    submitButtonProps,
    withSeconds,
    level,
    defaultLevel,
    size,
    variant,
    dropdownType,
    vars,
    minDate,
    maxDate,
    ...rest
  } = props;

  const getStyles = useStyles<DateTimePickerFactory>({
    name: 'DateTimePicker',
    classes,
    props,
    classNames,
    styles,
    unstyled,
    vars,
  });

  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi<DateTimePickerFactory>({
    classNames,
    styles,
    props,
  });

  const _valueFormat = valueFormat || (withSeconds ? 'DD/MM/YYYY HH:mm:ss' : 'DD/MM/YYYY HH:mm');

  const timeInputRef = useRef<HTMLInputElement>();
  const timeInputRefMerged = useMergedRef(timeInputRef, timeInputProps?.ref);

  const {
    calendarProps: { allowSingleDateInRange, ...calendarProps },
    others,
  } = pickCalendarProps(rest);

  const ctx = useDatesContext();
  const [_value, setValue] = useUncontrolledDates({
    type: 'default',
    value,
    defaultValue,
    onChange,
  });

  const formatTime = (dateValue: Date) =>
    dateValue ? dayjs(dateValue).format(withSeconds ? 'HH:mm:ss' : 'HH:mm') : '';

  const [timeValue, setTimeValue] = useState(formatTime(_value!));
  const [currentLevel, setCurrentLevel] = useState(level || defaultLevel || 'month');

  const [dropdownOpened, dropdownHandlers] = useDisclosure(false);
  const formattedValue = _value
    ? dayjs(_value).locale(ctx.getLocale(locale)).format(_valueFormat)
    : '';

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    timeInputProps?.onChange?.(event);
    const val = event.currentTarget.value;
    setTimeValue(val);

    if (val) {
      const [hours, minutes, seconds] = val.split(':').map(Number);
      const timeDate = shiftTimezone('add', new Date(), ctx.getTimezone());
      timeDate.setHours(hours);
      timeDate.setMinutes(minutes);
      timeDate.setSeconds(seconds || 0);
      setValue(assignTime(timeDate, _value || shiftTimezone('add', new Date(), ctx.getTimezone())));
    }
  };

  const handleDateChange = (date: DateValue) => {
    if (date) {
      setValue(assignTime(_value, date));
    }
    timeInputRef.current?.focus();
  };

  const handleTimeInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    timeInputProps?.onKeyDown?.(event);

    if (event.key === 'Enter') {
      event.preventDefault();
      dropdownHandlers.close();
    }
  };

  useDidUpdate(() => {
    if (!dropdownOpened) {
      setTimeValue(formatTime(_value!));
    }
  }, [_value, dropdownOpened]);

  useDidUpdate(() => {
    if (dropdownOpened) {
      setCurrentLevel('month');
    }
  }, [dropdownOpened]);

  const minTime = minDate ? dayjs(minDate).format('HH:mm:ss') : null;
  const maxTime = maxDate ? dayjs(maxDate).format('HH:mm:ss') : null;

  const __stopPropagation = dropdownType === 'popover';

  return (
    <PickerInputBase
      formattedValue={formattedValue}
      dropdownOpened={dropdownOpened}
      dropdownHandlers={dropdownHandlers}
      classNames={resolvedClassNames}
      styles={resolvedStyles}
      unstyled={unstyled}
      ref={ref}
      onClear={() => setValue(null)}
      shouldClear={!!_value}
      value={_value}
      size={size!}
      variant={variant}
      dropdownType={dropdownType}
      {...others}
      type="default"
      __staticSelector="DateTimePicker"
      // valueFormatter={valueFormatter}
    >
      <DatePicker
        {...calendarProps}
        maxDate={maxDate}
        minDate={minDate}
        size={size}
        variant={variant}
        type="default"
        value={_value}
        defaultDate={_value!}
        onChange={handleDateChange}
        locale={locale}
        classNames={resolvedClassNames}
        styles={resolvedStyles}
        unstyled={unstyled}
        __staticSelector="DateTimePicker"
        __stopPropagation={__stopPropagation}
        level={level}
        defaultLevel={defaultLevel}
        onLevelChange={(_level) => {
          setCurrentLevel(_level);
          calendarProps.onLevelChange?.(_level);
        }}
        __timezoneApplied
      />

      {currentLevel === 'month' && (
        <div {...getStyles('timeWrapper')}>
          <TimeInput
            value={timeValue}
            withSeconds={withSeconds}
            ref={timeInputRefMerged}
            unstyled={unstyled}
            minTime={
              _value && minDate && _value.toDateString() === minDate.toDateString()
                ? minTime != null
                  ? minTime
                  : undefined
                : undefined
            }
            maxTime={
              _value && maxDate && _value.toDateString() === maxDate.toDateString()
                ? maxTime != null
                  ? maxTime
                  : undefined
                : undefined
            }
            {...timeInputProps}
            {...getStyles('timeInput', {
              className: timeInputProps?.className,
              style: timeInputProps?.style,
            })}
            onChange={handleTimeChange}
            onKeyDown={handleTimeInputKeyDown}
            size={size}
            data-mantine-stop-propagation={__stopPropagation || undefined}
          />

          <ActionIcon<'button'>
            variant="default"
            size={`input-${size || 'sm'}`}
            {...getStyles('submitButton', {
              className: submitButtonProps?.className,
              style: submitButtonProps?.style,
            })}
            unstyled={unstyled}
            data-mantine-stop-propagation={__stopPropagation || undefined}
            // eslint-disable-next-line react/no-children-prop
            children={<CheckIcon size="30%" />}
            {...submitButtonProps}
            onClick={(event) => {
              submitButtonProps?.onClick?.(event);
              dropdownHandlers.close();
            }}
          />
        </div>
      )}
    </PickerInputBase>
  );
});

DateTimePicker.classes = { ...classes, ...PickerInputBase.classes, ...DatePicker.classes };
DateTimePicker.displayName = '@mantine/dates/DateTimePicker';

export default DateTimePicker;