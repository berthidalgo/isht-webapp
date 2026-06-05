"""Lee PISCO_HyM_GR2M (NetCDF) con xarray y agrega caudal/escorrentía por cuenca.
F1: el backend nunca toca el NetCDF; se agrega aquí una sola vez.
"""
import logging
log = logging.getLogger("isht.etl.oferta")


def load_oferta_por_cuenca(nc_path: str):
    """Implementar en F1: xarray → promedio por cuenca Pfafstetter."""
    raise NotImplementedError("Oferta PISCO pendiente — F1")
