import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { clsx } from "clsx";

import { Panorama } from "./panorama";

import styles from "./styles.module.scss";

type TProps = {
  name?: string;
  open: boolean;
  onClose: () => void;
};

export const Modal = ({ name, open, onClose }: TProps) => {
  return (
    <Dialog.Root open={open} modal={false}>
      <Dialog.Portal forceMount>
        <Dialog.Content
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          onInteractOutside={onClose}
          className={clsx(
            styles.content,
            open ? styles["content-open"] : styles["content-close"]
          )}
        >
          <Dialog.Title>
            Панорама объекта <span>{name}</span>
          </Dialog.Title>

          <Dialog.Description>
            <VisuallyHidden.Root>
              Панорама выбранного объекта
            </VisuallyHidden.Root>
          </Dialog.Description>

          <Panorama />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
