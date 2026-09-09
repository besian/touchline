import { colorFromId } from "../lib/format";

export function TeamCrest({ id, logo, name, size = 22 }: { id: number; logo: string; name: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 5,
        background: colorFromId(id),
        flex: "none",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {logo && (
        <img
          src={logo}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: "contain", padding: size > 24 ? 3 : 1 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          title={name}
        />
      )}
    </span>
  );
}
