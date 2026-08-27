from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/financas-open-finance-icon.png")
DESTINATIONS = [
    Path("/home/ubuntu/financas-open-finance/assets/images/icon.png"),
    Path("/home/ubuntu/financas-open-finance/assets/images/splash-icon.png"),
    Path("/home/ubuntu/financas-open-finance/assets/images/favicon.png"),
    Path("/home/ubuntu/financas-open-finance/assets/images/android-icon-foreground.png"),
]


def main() -> None:
    with Image.open(SOURCE) as original:
        resized = original.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
        optimized = resized.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
        for destination in DESTINATIONS:
            optimized.save(destination, format="PNG", optimize=True)
            print(f"{destination.name}: {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
