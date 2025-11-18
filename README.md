# ASCII React

A React application that converts images to animated ASCII art with smooth, organic row-by-row animations.

## Features

- 🖼️ Image to ASCII conversion with customizable resolution
- 🎨 Colored ASCII art output
- ✨ Smooth row-by-row fade-in animation
- 🌊 Organic left-right floating animation with independent row movements
- 📱 Responsive design with mobile optimizations
- ♿ Accessibility support (reduced motion)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

## Usage

1. Place your image file in the `public` folder
2. Update the `imageSrc` prop in `src/App.tsx` to point to your image
3. The app will automatically convert the image to ASCII art and display it with animations

## Customization

You can customize the ASCII conversion in `src/components/AsciiDisplay.tsx`:

- `resolution`: Controls the density of ASCII characters (default: 0.15)
- `grayscale`: Toggle between colored and grayscale output
- `charSet`: Choose from different character sets (standard, detailed, blocks, minimal)
- `aspectRatioX/Y`: Adjust horizontal and vertical stretch factors

## Technologies Used

- React 19
- TypeScript
- Create React App

## License

MIT
