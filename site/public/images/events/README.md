# site/public/images/events/

Hero images for event pages. One folder per event slug.

## Convention

```
site/public/images/events/
└── {event-slug}/
    └── hero.jpg        ← main image (optimise before committing: max ~1200px wide, <300KB)
```

Images are committed to the repo and served as static assets.

## Workflow

1. Find the image and source its attribution.
2. Add an **artwork** item to Zotero (group 6623153).
   - Set `sackar_atlas_id` in the Extra field (e.g. `sackar_atlas_id: trove-1978-mardi-gras-photo`)
   - Set `source_type: photograph` in Extra
   - Fill in: Title, Artist/Photographer, Archive, Rights, Date
3. Download the high-res file and optimise it.
4. Tell Web Ninja: **event slug** + **Zotero sackar_atlas_id**
5. Web Ninja will:
   - Create `site/public/images/events/{slug}/`
   - Add the `image:` field to the event YAML
6. Drop your image file into the folder Web Ninja created.

## Attribution

Attribution (artist, archive, rights) is pulled automatically from the linked
Zotero source record at build time. Do not duplicate it in the YAML — just keep
`source_id` pointing to the right Zotero item.

## Image guidelines

- Prefer originals from Trove, State Library NSW, NAA, or other open archives
- Check rights carefully — most archival press photos are not public domain
- Compress to JPEG, max ~1200px on longest edge, quality ~85
- Use descriptive filenames if needed: `protest-oxford-st.jpg` is fine alongside `hero.jpg`
