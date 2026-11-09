/** The Ezra fish (ichthys) symbol from the centre of the Figma nav bar, drawn as two crossing arcs. */
import Svg, { Path } from 'react-native-svg';

/** Draws the Ezra fish at `size` points in `color`. */
export function EzraMark({ size = 28, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* The arcs meet at the nose (left) and cross near the right to form the tail. */}
      <Path
        d="M2 12 Q11 3 22 16 M2 12 Q11 21 22 8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
