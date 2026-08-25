import type { ReactNode } from "react";
import { Box, Flex, IconButton } from "@radix-ui/themes";
import { Dialog } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";

interface DialogPanelProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function DialogPanel({
  open,
  title,
  description,
  onOpenChange,
  children
}: DialogPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content aria-describedby={undefined}>
        <Flex justify="between" align="start" mt="4" px="4">
          <Flex gap="0" direction="column">
            <Dialog.Title>{title}</Dialog.Title>
            {description && (
              <Dialog.Description>{description}</Dialog.Description>
            )}
          </Flex>

          <Dialog.Close>
            <IconButton size="3" variant="ghost">
              <Cross2Icon width="18" height="18" />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Box p="4">{children}</Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}
