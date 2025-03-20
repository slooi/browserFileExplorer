# Requirements (developed with)

1. node (v23.10.0)
2. pnpm (10.6.3)

# Setup

1. `cd` into root/server directory then install SERVER packages with `pnpm i`
2. `cd` into client directory then install CLIENT packages with `pnpm i`
3. Create a `.env` with a `DEFAULT_PATH` variable. Set `DEFAULT_PATH` to where you want the root directory for this browser file explorer to be. For example: `DEFAULT_PATH="C:/Users/YOUR_NAME/Downloads/dl/gallery-dl/"` 

# Running

1. `cd` into client and run `pnpm run dev` to start vite client server
2. `cd` into root/server directory and run `pnpm run dev` to start express server
3. Visit `localhost:7006` to open file explorer (`IP_ADDRESS_OF_YOUR_MACHINE:7006` also works)