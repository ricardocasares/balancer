# Balancer

Simple weighted load balancer with sticky connections

### Deploy to Now ▲

#### Example

Deploy a load balancer that from 15 requests will forward 10 to `a.site.com` and 5 to `b.site.com`

```bash
> now -e POOL="{\"https://a.site.com\": 10, \"https://b.site.com\": 5 }" ricardocasares/balancer
> now alias site.com
```
