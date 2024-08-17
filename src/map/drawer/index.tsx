import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";

import styles from "./styles.module.scss";

type TProps = {
  country?: string;
  name?: string;
  open: boolean;
  onClose: () => void;
};

export const Drawer = ({ country, name, open, onClose }: TProps) => {
  return (
    <Dialog.Root open={open} modal={false}>
      <Dialog.Portal forceMount>
        <Dialog.Content
          forceMount
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          onInteractOutside={onClose}
          className={clsx(
            styles.content,
            open ? styles["content-open"] : styles["content-close"]
          )}
        >
          <Dialog.Title>Информация о выбранном объекте</Dialog.Title>
          <Dialog.Description asChild>
            <div>
              <p>
                Страна: <span>{country}</span>
              </p>

              <p>
                Название объекта: <span>{name}</span>
              </p>
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
