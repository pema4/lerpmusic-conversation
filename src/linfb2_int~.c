#include "m_pd.h"
#include "math.h"
#include "string.h"

static t_class *linfb2_int_tilde_class = NULL;

typedef struct _linfb2_int_tilde {
  t_object x_obj;
  t_float x_f;
  t_sample *buffer; // output ring buffer
  int block_size;   // ring buffer length
} t_linfb2_int_tilde;

void *linfb2_int_tilde_new(void) {
  t_linfb2_int_tilde *x = (t_linfb2_int_tilde *)pd_new(linfb2_int_tilde_class);

  signalinlet_new(&x->x_obj, 0); // fold
  signalinlet_new(&x->x_obj, 0); // delay
  signalinlet_new(&x->x_obj, 0); // fb
  outlet_new(&x->x_obj, &s_signal);
  x->block_size = 0;
  x->buffer = NULL;

  return (void *)x;
}

void linfb2_int_tilde_free(t_linfb2_int_tilde *self) {
  freebytes(self->buffer, 2 * sizeof(t_sample) * self->block_size);
}

t_int *linfb2_int_tilde_perform(t_int *w) {
  t_linfb2_int_tilde *self = (t_linfb2_int_tilde *)(w[1]);
  t_sample *phase_in = (t_sample *)(w[2]);
  t_sample *fold_in = (t_sample *)(w[3]);
  t_sample *delay_in = (t_sample *)(w[4]);
  t_sample *fb_in = (t_sample *)(w[5]);
  t_sample *out = (t_sample *)(w[6]);
  int n = self->block_size;
  t_sample *buffer = self->buffer + n;
  /* get (and clip) the mixing-factor */

  for (int i = 0; i < n; i++) {
    int delay = *delay_in;
    t_sample mix = *delay_in++ - (float)delay;
    if (delay < 1) {
      delay = 1;
    } else if (delay > n) {
      delay = n;
    }
    // 2.2. mix = 0.2, delay = 2
    // 0.8 * f(2) + 0.2 * f(-3)
    t_sample a_feedback = *(buffer - delay) * (1 - mix);
    t_sample b_feedback = *(buffer - delay - 1) * mix;
    t_sample feedback = (a_feedback + b_feedback) * *fb_in++;

    t_sample result = sin(*fold_in++ * *phase_in++ + feedback);
    *buffer++ = result;
    *out++ = result;
  }
  memcpy(self->buffer, self->buffer + n, n * sizeof(t_sample));

  /* return a pointer to the dataspace for the next dsp-object */
  return (w + 7);
}

void linfb2_int_tilde_dsp(t_linfb2_int_tilde *self, t_signal **sp) {
  int block_size = sp[0]->s_n;
  size_t buffer_bytes = sizeof(t_sample) * block_size * 2;
  if (self->buffer == NULL) {
    self->buffer = getbytes(buffer_bytes);
  } else {
    size_t old_buffer_bytes = sizeof(t_sample) * self->block_size * 2;
    self->buffer = resizebytes(self->buffer, old_buffer_bytes, buffer_bytes);
  }
  self->block_size = block_size;

  dsp_add(linfb2_int_tilde_perform, 6, self, sp[0]->s_vec, sp[1]->s_vec,
          sp[2]->s_vec, sp[3]->s_vec, sp[4]->s_vec);
  post("s_n: %d", sp[3]->s_n);
  post("dsp");
}

void linfb2_int_tilde_setup(void) {
  linfb2_int_tilde_class =
      class_new(gensym("linfb2_int~"), (t_newmethod)linfb2_int_tilde_new,
                (t_method)linfb2_int_tilde_free, sizeof(t_linfb2_int_tilde),
                CLASS_DEFAULT, NULL);

  class_addmethod(linfb2_int_tilde_class, (t_method)linfb2_int_tilde_dsp,
                  gensym("dsp"), A_CANT, 0);
  /* if no signal is connected to the first inlet, we can as well
   * connect a number box to it and use it as "signal"
   */
  CLASS_MAINSIGNALIN(linfb2_int_tilde_class, t_linfb2_int_tilde, x_f);
}
