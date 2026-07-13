'use client';
/**
 * R3F mesh backends for the neutral drawable atoms — the 3D twin of the atoms'
 * 2D `paint*` fns. Kept HERE (not in the atom files) so the `three`/`drei`/`fiber`
 * dependency stays out of the 2D paint path; only the 3D dispatcher `Drawable3D`
 * (→ used by `GameCanvas3D`, itself in the code-split 3D surface) imports this.
 * Each mesh consumes the SAME descriptor as its 2D painter, so canvas-2d and
 * canvas-3d render the same `children`.
 */
import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { DrawSpriteProps } from '../../../components/game/atoms/DrawSprite';
import type { DrawShapeProps } from '../../../components/game/atoms/DrawShape';
import type { DrawTextProps } from '../../../components/game/atoms/DrawText';
import type { Projector3D } from '../projector3d';
import { isValidScenePos } from '../contract';
import { getAtlas, isAtlasAsset, subRectFor } from '../../../lib/atlasSlice';
import { ModelLoader } from './ModelLoader';

/**
 * 2D-sprite-as-billboard 3D path. Crops UVs to `node.frame` when present.
 * Atlas-name resolution (`asset.atlas`/`asset.sprite` → sub-rect) is deferred
 * to P6 for the 3D path — a tracked follow-up, not a silent drop; until then
 * an atlas-only asset without an explicit `frame` renders the whole sheet.
 *
 * This deliberately avoids R3F `useLoader`: `useLoader` throws into the nearest
 * `<Suspense>`, and the `Canvas` host's only Suspense boundary is the lazy host
 * import with a `null` fallback. A suspended sprite therefore blanks the entire
 * 3D scene (grid, shapes, text) until every texture finishes. We load manually
 * with `crossOrigin="anonymous"` so CDN textures paint and keep the scene alive
 * with a placeholder while they download.
 */
class CrossOriginTextureLoader extends THREE.TextureLoader {
    constructor() {
        super();
        this.crossOrigin = 'anonymous';
    }
}

function useBillboardTexture(url: string): { texture: THREE.Texture | null; error: boolean } {
    const [state, setState] = React.useState<{ texture: THREE.Texture | null; error: boolean }>({
        texture: null,
        error: false,
    });

    React.useEffect(() => {
        let active = true;
        const loader = new CrossOriginTextureLoader();
        loader.load(
            url,
            (texture) => {
                if (!active) return;
                texture.colorSpace = THREE.SRGBColorSpace;
                setState({ texture, error: false });
            },
            undefined,
            () => {
                if (!active) return;
                setState({ texture: null, error: true });
            },
        );
        return () => {
            active = false;
        };
    }, [url]);

    return state;
}

interface SpriteFrame {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Resolve an atlas sub-rect for `asset.atlas`/`asset.sprite`, mirroring the 2D
 * `atlasSlice` path. Triggers a re-render once the atlas JSON finishes loading.
 */
function useAtlasFrame(asset: DrawSpriteProps['asset']): { frame: SpriteFrame | null; ready: boolean } {
    const [tick, setTick] = React.useState(0);

    React.useEffect(() => {
        if (!isAtlasAsset(asset)) return;
        getAtlas(asset.atlas as string, () => setTick((t) => t + 1));
    }, [asset, tick]);

    return React.useMemo(() => {
        if (!isAtlasAsset(asset)) return { frame: null, ready: true };
        const atlas = getAtlas(asset.atlas as string, () => setTick((t) => t + 1));
        if (!atlas) {
            return { frame: null, ready: false };
        }
        const r = subRectFor(atlas, asset.sprite as string);
        if (!r) return { frame: null, ready: true };
        return { frame: { x: r.sx, y: r.sy, w: r.sw, h: r.sh }, ready: true };
    }, [asset, tick]);
}

function SpriteBillboard({ node, world, cellSize = 1 }: { node: DrawSpriteProps; world: [number, number, number]; cellSize?: number }): React.JSX.Element {
    const { texture, error: textureError } = useBillboardTexture(node.asset.url);
    const { frame: atlasFrame, ready: atlasReady } = useAtlasFrame(node.asset);

    const frame = node.frame ?? atlasFrame;
    const anchor = node.anchor ?? 'top-left';

    const size = React.useMemo(() => {
        const img = texture?.image as { width?: number; height?: number } | undefined;
        const imgW = img?.width || 1;
        const imgH = img?.height || 1;
        const aspect = frame ? frame.w / frame.h : imgW / imgH;
        if (anchor === 'top-left') {
            // Ground decal: explicit size in world units, defaulting to one cell.
            const width = (node.width ?? 1) * cellSize;
            const height = (node.height ?? 1) * cellSize;
            return { width, height, imgW, imgH };
        }
        const height = node.height ?? 1;
        const width = node.width ?? height * aspect;
        return { width: width * cellSize, height: height * cellSize, imgW, imgH };
    }, [texture, frame, node.height, node.width, anchor, cellSize]);

    const groundGeometry = React.useMemo(() => {
        if (anchor !== 'top-left' || !texture || !atlasReady) return null;
        const g = new THREE.PlaneGeometry(size.width, size.height);
        g.rotateX(-Math.PI / 2);
        return g;
    }, [anchor, texture, atlasReady, size.width, size.height]);

    if (!texture || !atlasReady) {
        // Placeholder keeps the scene mounted and gives a visible cue while the
        // CDN texture/atlas downloads; red signals a load failure.
        if (anchor === 'top-left') {
            return (
                <group position={[world[0] + size.width / 2, 0.02, world[2] + size.height / 2]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[size.width, size.height]} />
                        <meshBasicMaterial color={textureError ? 0xff4444 : 0x888888} transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            );
        }
        return (
            <group position={[world[0], world[1] + size.height / 2, world[2]]}>
                <mesh>
                    <planeGeometry args={[size.width, size.height]} />
                    <meshBasicMaterial color={textureError ? 0xff4444 : 0x888888} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
            </group>
        );
    }

    texture.magFilter = texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    // Top-left anchored sprites are ground decals (tiles/covers); everything else
    // stands vertically on the cell.
    if (frame) {
        texture.repeat.set(frame.w / size.imgW, frame.h / size.imgH);
        texture.offset.set(frame.x / size.imgW, 1 - (frame.y + frame.h) / size.imgH);
    }

    if (anchor === 'top-left') {
        return (
            <group position={[world[0] + size.width / 2, 0.01, world[2] + size.height / 2]}>
                <mesh geometry={groundGeometry ?? undefined}>
                    <meshBasicMaterial
                        map={texture}
                        transparent
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        opacity={node.opacity ?? 1}
                    />
                </mesh>
            </group>
        );
    }

    return (
        <Billboard position={[world[0], world[1] + size.height / 2, world[2]]}>
            <mesh>
                <planeGeometry args={[size.width, size.height]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    opacity={node.opacity ?? 1}
                />
            </mesh>
        </Billboard>
    );
}

/** R3F mesh backend for `draw-sprite`: a GLB via `ModelLoader` when `asset.dimension === '3d'`; else a billboard. */
export function Sprite3D({ node, projector }: { node: DrawSpriteProps; projector: Projector3D }): React.JSX.Element | null {
    const asset = node.asset;
    // Mirrors the 2D `paintSprite` contract: a drawable with no resolvable asset
    // or position renders nothing — it never throws (one bad item must not blank the scene).
    if (!asset?.url || !isValidScenePos(node.position)) return null;
    if (asset.dimension === '3d') {
        // GLB scale = the sprite's authored world size: uniform from `width` alone;
        // [width, height, width] when `height` is authored too, so a side-view tile
        // (340×32 px) becomes a slab instead of a cube. Grid boards author width ==
        // height, so their uniform scale is unchanged.
        const scale: number | [number, number, number] =
            node.width === undefined
                ? 1
                : node.height === undefined
                  ? node.width * projector.cellSize
                  : [
                        node.width * projector.cellSize,
                        node.height * projector.cellSize,
                        node.width * projector.cellSize,
                    ];
        return (
            <group position={projector.toWorld(node.position)}>
                <ModelLoader
                    url={asset.url}
                    scale={scale}
                    rotation={[0, node.rotation ?? 0, 0]}
                    animation={node.animation}
                    fallbackGeometry="box"
                    castShadow
                    receiveShadow
                />
            </group>
        );
    }
    return <SpriteBillboard node={node} world={projector.toWorld(node.position)} cellSize={projector.cellSize} />;
}

/** R3F mesh backend for `draw-shape`: a flat mesh on the ground plane. */
export function Shape3D({ node, projector }: { node: DrawShapeProps; projector: Projector3D }): React.JSX.Element | null {
    if (!isValidScenePos(node.position)) return null;
    const world = projector.toWorld(node.position);
    const color = node.fill ?? node.stroke ?? '#ffffff';

    let geometry: React.JSX.Element;
    switch (node.shape) {
        case 'cell':
        case 'rect': {
            const w = node.shape === 'cell' ? projector.cellSize * 0.95 : (node.width ?? 1) * projector.cellSize;
            const h = node.shape === 'cell' ? projector.cellSize * 0.95 : (node.height ?? 1) * projector.cellSize;
            geometry = <planeGeometry args={[w, h]} />;
            break;
        }
        case 'ellipse': {
            const radiusX = node.radiusX ?? 0.4;
            geometry =
                node.stroke && !node.fill ? (
                    <ringGeometry args={[Math.max(0, radiusX - 0.08), radiusX, 32]} />
                ) : (
                    <circleGeometry args={[radiusX, 32]} />
                );
            break;
        }
        case 'poly': {
            if (!node.points || node.points.length === 0) return null;
            const s = new THREE.Shape();
            node.points.forEach((p, i) => {
                if (i === 0) s.moveTo(p.x, p.y);
                else s.lineTo(p.x, p.y);
            });
            s.closePath();
            geometry = <shapeGeometry args={[s]} />;
            break;
        }
        default:
            return null;
    }

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world[0], world[1] + 0.02, world[2]]}>
            {geometry}
            <meshBasicMaterial color={color} transparent opacity={node.opacity ?? 1} side={THREE.DoubleSide} />
        </mesh>
    );
}

/** R3F mesh backend for `draw-text`: a billboarded drei `<Text>` above the scene position. */
export function Text3D({ node, projector }: { node: DrawTextProps; projector: Projector3D }): React.JSX.Element | null {
    if (!isValidScenePos(node.position)) return null;
    const world = projector.toWorld(node.position);
    return (
        <Billboard position={[world[0], world[1] + 1.2, world[2]]}>
            <Text
                fontSize={0.32}
                color={node.color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {node.text}
            </Text>
        </Billboard>
    );
}
