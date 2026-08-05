FROM emscripten/emsdk:latest AS wasm-builder

WORKDIR /build

COPY src/wasm ./src/wasm

RUN mkdir -p ./public/wasm && \
    for file in ./src/wasm/*.cpp; do \
        name=$(basename "$file" .cpp); \
        echo "Compiling $name.cpp -> $name.wasm"; \
        em++ "$file" \
            -O3 \
            -s STANDALONE_WASM \
            --no-entry \
            -Wl,--export-all \
            -o "./public/wasm/$name.wasm"; \
    done

FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY --from=wasm-builder /build/public/wasm ./public/wasm

EXPOSE 3001

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]