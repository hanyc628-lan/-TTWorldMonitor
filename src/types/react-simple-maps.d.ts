declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties } from 'react';

  export interface Geography {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown>;
    geometry: unknown;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, number | number[]>;
    className?: string;
    children?: ReactNode;
  }

  export interface GeographyProps {
    geography: Geography;
    onClick?: () => void;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function Geographies(props: {
    geography: string;
    children: (args: { geographies: Geography[] }) => ReactNode;
  }): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
  export function Marker(props: MarkerProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
}
