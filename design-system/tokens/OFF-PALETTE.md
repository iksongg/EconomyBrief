# 디자인 시스템 밖 색 (Off-palette colors)

v2 토큰 이전과 회색 글자 2단계 통합 후에도 코드에 남은 하드코딩 색 목록이에요. 토큰과 값이 달라 자동으로 바꾸지 않았어요.
가까운 토큰으로 맞출지, 새 토큰으로 정의할지 디자인 판단이 필요한 다음 정리 대상이에요.

- 남은 하드코딩: **160곳 / 72가지 색**
- 범위: 루트 HTML 21개 + assets/css (style 블록·style 속성·CSS 파일의 색 속성)
- `거리`: 가장 가까운 토큰과의 RGB 거리 (작을수록 비슷함, 10 이하는 거의 같은 색)

| 색 | 사용 수 | 가장 가까운 토큰 | 거리 |
|---|---:|---|---:|
| `#EAEBEF` | 21 | `--color-border-default` | 7 |
| `#F8F8FC` | 9 | `--color-bg-canvas` | 3 |
| `#DDE1FF` | 8 | `--color-tag-blue-bg` | 21 |
| `#0D0D14` | 8 | `--color-text-primary` | 27 |
| `#C2C6D1` | 6 | `--color-border-strong` | 21 |
| `#F1F1F1` | 6 | `--color-tag-gray-bg` | 6 |
| `#1C1B1F` | 5 | `--color-text-primary` | 50 |
| `#EFF6FF` | 5 | `--color-tag-purple-bg` | 6 |
| `#E6E9F0` | 5 | `--color-border-default` | 5 |
| `#000000` | 4 | `--color-text-primary` | 0 |
| `#DCE9FE` | 3 | `--color-tag-blue-bg` | 17 |
| `#F3F6FF` | 3 | `--color-tag-purple-bg` | 8 |
| `#101112` | 3 | `--color-text-primary` | 29 |
| `#E2E4E9` | 2 | `--color-border-default` | 5 |
| `#F1F2F5` | 2 | `--color-tag-gray-bg` | 3 |
| `#F6F7FB` | 2 | `--color-bg-canvas` | 5 |
| `#DBDBDB` | 2 | `--color-border-strong` | 13 |
| `#E4E2DD` | 2 | `--color-border-default` | 15 |
| `#CECBC6` | 2 | `--color-border-strong` | 20 |
| `#FAFBFE` | 2 | `--color-bg-canvas` | 4 |
| `#353535` | 2 | `--color-text-secondary` | 33 |
| `#E7F9EF` | 2 | `--color-tag-green-bg` | 5 |
| `#E8EBF0` | 2 | `--color-border-default` | 7 |
| `#F4F6FE` | 2 | `--color-bg-canvas` | 8 |
| `#243D80` | 2 | `--color-text-secondary` | 57 |
| `#16171B` | 2 | `--color-text-primary` | 42 |
| `#4B8C6B` | 2 | `--color-text-tertiary` | 46 |
| `#591BAF` | 2 | `--color-text-tertiary` | 95 |
| `#0F39A3` | 1 | `--color-text-secondary` | 98 |
| `#1F1F1F` | 1 | `--color-text-primary` | 54 |
| `#121212` | 1 | `--color-text-primary` | 31 |
| `#1C1C1E` | 1 | `--color-text-primary` | 50 |
| `#333333` | 1 | `--color-text-secondary` | 36 |
| `#E9EAEE` | 1 | `--color-border-default` | 5 |
| `#F1F0EC` | 1 | `--color-tag-green-bg` | 11 |
| `#CFCDC8` | 1 | `--color-border-strong` | 17 |
| `#E0DEDA` | 1 | `--color-border-strong` | 19 |
| `#F4F2EF` | 1 | `--color-tag-gray-bg` | 7 |
| `#B9B7B2` | 1 | `--color-text-disabled` | 13 |
| `#C2C2C2` | 1 | `--color-text-disabled` | 9 |
| `#EEEEEE` | 1 | `--color-tag-green-bg` | 11 |
| `#D9D9D9` | 1 | `--color-border-strong` | 10 |
| `#95A9BE` | 1 | `--color-text-disabled` | 45 |
| `#EAEDF9` | 1 | `--color-tag-blue-bg` | 8 |
| `#A8C5FD` | 1 | `--color-brand-subtle` | 9 |
| `#F7F9F8` | 1 | `--color-bg-canvas` | 4 |
| `#16522D` | 1 | `--color-text-secondary` | 58 |
| `#FBFCFE` | 1 | `--color-bg-canvas` | 5 |
| `#E4ECFF` | 1 | `--color-tag-blue-bg` | 8 |
| `#0FB880` | 1 | `--color-text-tertiary` | 106 |
| `#F0F0F2` | 1 | `--color-tag-gray-bg` | 6 |
| `#F0F1F5` | 1 | `--color-tag-gray-bg` | 4 |
| `#1262FB` | 1 | `--color-brand-primary` | 18 |
| `#ECF1FF` | 1 | `--color-tag-blue-bg` | 2 |
| `#E3E5EB` | 1 | `--color-border-default` | 4 |
| `#E5F2FF` | 1 | `--color-tag-blue-bg` | 5 |
| `#1C61D9` | 1 | `--color-brand-primary` | 34 |
| `#F6F9FF` | 1 | `--color-bg-canvas` | 6 |
| `#262930` | 1 | `--color-text-secondary` | 50 |
| `#F9FBFA` | 1 | `--color-bg-canvas` | 1 |
| `#FAFAFC` | 1 | `--color-bg-canvas` | 2 |
| `#B5CBFD` | 1 | `--color-brand-subtler` | 16 |
| `#F3F2FE` | 1 | `--color-tag-purple-bg` | 5 |
| `#6140E9` | 1 | `--color-tag-purple-fg` | 50 |
| `#212121` | 1 | `--color-text-primary` | 57 |
| `#FF7644` | 1 | `--color-text-disabled` | 155 |
| `#E8F1FF` | 1 | `--color-tag-blue-bg` | 2 |
| `#112840` | 1 | `--color-text-secondary` | 58 |
| `#EDF2FD` | 1 | `--color-tag-purple-bg` | 3 |
| `#F7F8FC` | 1 | `--color-bg-canvas` | 4 |
| `#5B916D` | 1 | `--color-text-tertiary` | 43 |
| `#D64F55` | 1 | `--color-text-tertiary` | 136 |
