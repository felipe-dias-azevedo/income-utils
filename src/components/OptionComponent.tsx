import { Flex, SegmentedControl, Select, Text } from "@radix-ui/themes";

export interface OptionValue<T extends string> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

interface OptionComponentProps<T extends string> {
  label?: string;
  hideLabel?: boolean;
  onChange: (value: T) => void;
  value: T;
  options: Record<T, OptionValue<T>>;
}

export default function OptionComponent<T extends string>({
  label,
  hideLabel,
  options,
  onChange,
  value
}: OptionComponentProps<T>) {
  const optionValues = Object.values(options) as OptionValue<T>[];

  return (
    <>
      <Flex display={{ initial: "none", md: "flex" }}>
        <SegmentedControl.Root
          value={value}
          onValueChange={onChange}
          className="segmented-colored"
        >
          {optionValues.map(({ value, label, icon }) => (
            <SegmentedControl.Item key={value} value={value}>
              <Flex as="span" align="center" gap="2">
                {icon}
                {label}
              </Flex>
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </Flex>

      <Flex
        direction="column"
        align="stretch"
        style={{ flex: 1, minWidth: "120px" }}
        gap="1"
        display={{ initial: "flex", md: "none" }}
      >
        {!hideLabel && (
          <Text size="1" weight="medium" as="label">
            {label}
          </Text>
        )}

        <Select.Root value={value} onValueChange={onChange}>
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              {optionValues.map(({ value, label, icon }) => (
                <Select.Item key={value} value={value}>
                  <Flex as="span" align="center" gap="2">
                    {icon}
                    {label}
                  </Flex>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Flex>
    </>
  );
}
