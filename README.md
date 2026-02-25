# Vibecheck (temp name)
A browsres extension that scans social media/news sites as you browse and blocks posts/articles/videos that it deemes too negative (configurable, also other feelings)
## Installation
These steps are necessary to avoid large files on github
1. `npm install`
2. Copy all files from `node_modules/onnxruntime-web/` to `public/onnx-wasm`
3. Export the model
- Install optimum cli & ONNX modules: 
`pip install optimum optimum[exporters] transformers torch onnx onnxruntime`
`pip install --upgrade --upgrade-strategy eager optimum[onnx]`
- Export the NLP model to ONNX:
```optimum-cli export onnx --model j-hartmann/emotion-english-distilroberta-base --task text-classification --optimize O3 ./public/models/j-hartmann/emotion-english-distilroberta-base/```
## Todo
- [ ] Extract data from sites
    - [ ] Youtube
    - [ ] Instagram
    - [x] X/Twitter
- [ ] Make an NLP model run in the browser
- [ ] Block content
- [ ] Add configuration
    - [ ] UI
    - [ ] Technical implementation
