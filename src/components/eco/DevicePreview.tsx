import { useState, type ReactNode } from "react";

type DeviceMode = "normal" | "iphone" | "android" | "tablet";

export default function DevicePreview({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<DeviceMode>("normal");

  return (
    <div className={`dp-root dp-mode-${mode}`}>
      <style>{`
        .dp-root {
          min-height: 100vh;
          width: 100%;
          background: var(--background, #071713);
          color: var(--foreground, #f0fdf4);
          box-sizing: border-box;
        }

        .dp-root * {
          box-sizing: border-box;
        }

        .dp-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: #0b1c17;
          border-bottom: 1px solid #244c3c;
        }

        .dp-toolbar-title {
          font-weight: 800;
          font-size: 14px;
        }

        .dp-toolbar-subtitle {
          display: block;
          margin-top: 3px;
          font-size: 11px;
          color: #9bbdad;
        }

        .dp-options {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .dp-option {
          border: 1px solid #36584b;
          border-radius: 9px;
          background: #142923;
          color: #dcfce7;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .dp-option[aria-pressed="true"] {
          background: #22c55e;
          color: #052e16;
          border-color: #22c55e;
        }

        .dp-stage {
          min-height: calc(100vh - 65px);
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 0;
          transition: background .3s ease, padding .3s ease;
        }

        .dp-device {
          width: 100%;
          min-height: calc(100vh - 65px);
          overflow: hidden;
          background: #fff;
          color: #111827;
          transition: width .35s ease, height .35s ease,
            border-radius .35s ease, box-shadow .35s ease,
            margin .35s ease;
        }

        .dp-screen {
          width: 100%;
          min-height: inherit;
          overflow-x: hidden;
          background: #071713;
          color: #f0fdf4;
        }

        .dp-screen > * {
          max-width: 100%;
        }

        .dp-mode-normal .dp-stage {
          display: block;
          padding: 0;
          background: transparent;
        }

        .dp-mode-normal .dp-device {
          width: 100%;
          min-height: calc(100vh - 65px);
          border: 0;
          border-radius: 0;
          box-shadow: none;
          margin: 0;
        }

        .dp-mode-iphone .dp-stage,
        .dp-mode-android .dp-stage,
        .dp-mode-tablet .dp-stage {
          align-items: flex-start;
          padding: 28px 16px;
          background:
            radial-gradient(ellipse at top, #234b3b 0%, #101f19 50%, #07110e 100%);
        }

        .dp-mode-iphone .dp-device {
          width: 390px;
          max-width: 100%;
          min-height: 780px;
          border: 8px solid #171717;
          border-radius: 48px;
          box-shadow: 0 24px 70px #0009;
          margin: 0 auto;
          position: relative;
        }

        .dp-mode-iphone .dp-device::before {
          content: "";
          position: absolute;
          z-index: 5;
          top: 7px;
          left: 50%;
          transform: translateX(-50%);
          width: 112px;
          height: 25px;
          border-radius: 20px;
          background: #171717;
          pointer-events: none;
        }

        .dp-mode-iphone .dp-screen {
          min-height: 764px;
          border-radius: 36px;
          padding-top: 12px;
        }

        .dp-mode-android .dp-device {
          width: 393px;
          max-width: 100%;
          min-height: 800px;
          border: 7px solid #30343a;
          border-radius: 28px;
          box-shadow: 0 24px 70px #0009;
          margin: 0 auto;
          position: relative;
        }

        .dp-mode-android .dp-device::before {
          content: "";
          position: absolute;
          z-index: 5;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 70px;
          height: 6px;
          border-radius: 10px;
          background: #16181b;
          pointer-events: none;
        }

        .dp-mode-android .dp-screen {
          min-height: 786px;
          border-radius: 20px;
          padding-top: 8px;
        }

        .dp-mode-tablet .dp-stage {
          padding: 28px 16px;
        }

        .dp-mode-tablet .dp-device {
          width: 900px;
          max-width: 100%;
          min-height: 650px;
          border: 10px solid #30343a;
          border-radius: 28px;
          box-shadow: 0 24px 70px #0009;
          margin: 0 auto;
        }

        .dp-mode-tablet .dp-screen {
          min-height: 630px;
          border-radius: 17px;
        }

        @media (max-width: 480px) {
          .dp-toolbar {
            padding: 10px;
          }

          .dp-options {
            width: 100%;
          }

          .dp-option {
            flex: 1;
            padding: 9px 6px;
          }

          .dp-mode-iphone .dp-stage,
          .dp-mode-android .dp-stage {
            padding: 12px 6px;
          }

          .dp-mode-iphone .dp-device {
            min-height: 720px;
            border-radius: 38px;
          }

          .dp-mode-iphone .dp-screen {
            min-height: 704px;
            border-radius: 28px;
          }

          .dp-mode-android .dp-device {
            min-height: 740px;
          }

          .dp-mode-android .dp-screen {
            min-height: 726px;
          }
        }
      `}</style>

      <header className="dp-toolbar">
        <div>
          <div className="dp-toolbar-title">EcoTwin AI · Device Preview</div>
          <span className="dp-toolbar-subtitle">
            Select a device to preview your app
          </span>
        </div>

        <div className="dp-options">
          {(
            [
              ["normal", "Normal"],
              ["iphone", "iPhone"],
              ["android", "Android"],
              ["tablet", "Tablet"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="dp-option"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="dp-stage">
        <div className="dp-device">
          <div className="dp-screen">{children}</div>
        </div>
      </div>
    </div>
  );
}