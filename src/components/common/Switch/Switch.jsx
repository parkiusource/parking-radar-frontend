import { useRef } from 'react';

import { getSwitchClassName } from './getSwitchClassName';

export const Switch = ({ className, size, variant, ...rest }) => {
  const switchRef = useRef(null);
  return (
    <input
      {...rest}
      type="checkbox"
      className={getSwitchClassName({ className, size, variant })}
      ref={switchRef}
    />
  );
};

export default Switch;
