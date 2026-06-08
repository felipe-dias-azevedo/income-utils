import { Flex, SegmentedControl, Select, Text } from "@radix-ui/themes";
import { useMemo, type ComponentProps } from "react";

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
  component?: "menu" | "segmented";
}

type FlexDisplay = ComponentProps<typeof Flex>["display"];

export default function OptionComponent<T extends string>({
  component: force,
  label,
  hideLabel,
  options,
  onChange,
  value
}: OptionComponentProps<T>) {
  const optionValues = useMemo(
    () => Object.values(options) as OptionValue<T>[],
    [options]
  );

  const display: {
    menu: FlexDisplay;
    segmented: FlexDisplay;
  } = useMemo(() => {
    if (force === "menu") {
      return { menu: "flex", segmented: "none" };
    } else if (force === "segmented") {
      return { menu: "none", segmented: "flex" };
    } else {
      return {
        menu: { initial: "flex", md: "none" },
        segmented: { initial: "none", md: "flex" }
      };
    }
  }, [force]);

  return (
    <>
      <Flex display={display.segmented}>
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
        style={{ flex: 1, minWidth: "200px" }}
        gap="1"
        display={display.menu}
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
